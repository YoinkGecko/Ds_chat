import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Module-level socket — created once, never recreated
const socket = io("http://localhost:4000", { autoConnect: true });

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function Page() {
  // ── Chat ─────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selfUsername, setSelfUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // ── Call UI state (drives renders) ───────────────────────────────────────
  const [callState, setCallState] = useState("idle"); // idle|outgoing|incoming|active
  const [callType, setCallType] = useState("voice");
  const [callPeer, setCallPeer] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  // ── Refs — always hold the LATEST value, safe inside socket handlers ─────
  const selfUsernameRef = useRef("");
  const callStateRef = useRef("idle");
  const callPeerRef = useRef(null);
  const callTypeRef = useRef("voice");
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null); // store remote stream for re-apply
  const incomingOfferRef = useRef(null); // stores offer while ringing
  const callTimerRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => {
    selfUsernameRef.current = selfUsername;
  }, [selfUsername]);
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);
  useEffect(() => {
    callPeerRef.current = callPeer;
  }, [callPeer]);
  useEffect(() => {
    callTypeRef.current = callType;
  }, [callType]);

  // ── Video / audio elements ────────────────────────────────────────────────
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getInitial = (name) => (name ? name[0].toUpperCase() : "?");
  const palettes = [
    { bg: "linear-gradient(135deg,#4647d3,#6366f1)", text: "#fff" },
    { bg: "linear-gradient(135deg,#b80438,#e11d48)", text: "#fff" },
    { bg: "linear-gradient(135deg,#006947,#059669)", text: "#fff" },
    { bg: "linear-gradient(135deg,#7c3aed,#a78bfa)", text: "#fff" },
    { bg: "linear-gradient(135deg,#0369a1,#38bdf8)", text: "#fff" },
  ];
  const getPalette = (name) =>
    palettes[(name?.charCodeAt(0) || 0) % palettes.length];

  const formatDuration = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── Chat API ──────────────────────────────────────────────────────────────
  const fetchBestServer = async () => {
    const r = await axios.get("http://localhost:4000/bs");
    return r.data.bestServer;
  };

  const getMessages = async (user) => {
    setSelectedUser(user);
    try {
      const srv = await fetchBestServer();
      const res = await axios.get(`${srv}/messages`, {
        params: { user1: selfUsernameRef.current, user2: user },
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const send = async () => {
    if (!text.trim()) return;
    try {
      const srv = await fetchBestServer();
      await axios.post(`${srv}/send`, {
        sender: selfUsernameRef.current,
        receiver: selectedUser,
        message: text,
      });
      setMessages((prev) => [
        ...prev,
        { sender: selfUsernameRef.current, message: text },
      ]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    if (!selectedUser || !selfUsername) return;
    const id = setInterval(async () => {
      try {
        const srv = await fetchBestServer();
        const res = await axios.get(`${srv}/messages`, {
          params: { user1: selfUsername, user2: selectedUser },
        });
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [selectedUser, selfUsername]);

  useEffect(() => {
    const uname = localStorage.getItem("myUsername") || "";
    setSelfUsername(uname);
    selfUsernameRef.current = uname;

    (async () => {
      try {
        const srv = await fetchBestServer();
        const res = await axios.get(`${srv}/users`);
        setUsers(res.data);
      } catch (err) {
        alert(err);
      }
    })();
  }, []);

  // Register with signaling server whenever username is ready
  useEffect(() => {
    if (!selfUsername) return;
    socket.emit("register", selfUsername);
  }, [selfUsername]);

  // ── WebRTC helpers ────────────────────────────────────────────────────────
  const startTimer = () => {
    clearInterval(callTimerRef.current);
    setCallDuration(0);
    callTimerRef.current = setInterval(
      () => setCallDuration((d) => d + 1),
      1000,
    );
  };

  const cleanupCall = useCallback(() => {
    clearInterval(callTimerRef.current);
    callTimerRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;

    pcRef.current?.close();
    pcRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    incomingOfferRef.current = null;
    callPeerRef.current = null;
    callStateRef.current = "idle";

    setCallState("idle");
    setCallPeer(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsCamOff(false);
  }, []);

  // Build a fresh RTCPeerConnection and wire up its events
  const createPC = useCallback(
    (peer) => {
      // Close any existing one first
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit("call:ice", {
            to: peer,
            from: selfUsernameRef.current,
            candidate,
          });
        }
      };

      pc.ontrack = ({ streams }) => {
        const stream = streams[0];
        remoteStreamRef.current = stream;
        // Video calls: assign to <video> (handles both audio+video tracks)
        // Voice calls: assign to hidden <audio>
        if (callTypeRef.current === "video") {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        } else {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
          }
        }
      };

      pc.onconnectionstatechange = () => {
        const s = pc.connectionState;
        console.log("PC state:", s);
        if (s === "disconnected" || s === "failed" || s === "closed") {
          cleanupCall();
        }
      };

      return pc;
    },
    [cleanupCall],
  );

  const getUserMedia = async (type) => {
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
  };

  // ── Start outgoing call ───────────────────────────────────────────────────
  const startCall = useCallback(
    async (peer, type) => {
      if (callStateRef.current !== "idle") return;

      setCallPeer(peer);
      setCallType(type);
      setCallState("outgoing");
      callPeerRef.current = peer;
      callTypeRef.current = type;
      callStateRef.current = "outgoing";

      let stream;
      try {
        stream = await getUserMedia(type);
      } catch (err) {
        alert("Microphone/camera access denied:\n" + err.message);
        cleanupCall();
        return;
      }

      localStreamRef.current = stream;
      // Defer srcObject assignment — the video element renders after state update
      if (type === "video") {
        setTimeout(() => {
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        }, 50);
      }

      const pc = createPC(peer);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:invite", {
        to: peer,
        from: selfUsernameRef.current,
        callType: type,
        offer,
      });
    },
    [cleanupCall, createPC],
  );

  // ── Answer incoming call ──────────────────────────────────────────────────
  const answerCall = useCallback(async () => {
    const peer = callPeerRef.current;
    const type = callTypeRef.current;
    const offer = incomingOfferRef.current;
    if (!peer || !offer) return;

    let stream;
    try {
      stream = await getUserMedia(type);
    } catch (err) {
      alert("Microphone/camera access denied:\n" + err.message);
      socket.emit("call:reject", { to: peer, from: selfUsernameRef.current });
      cleanupCall();
      return;
    }

    localStreamRef.current = stream;
    // Defer srcObject — state is already "incoming", video el is rendered but
    // setCallState("active") hasn't happened yet; setTimeout keeps it safe
    if (type === "video") {
      setTimeout(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }, 50);
    }

    const pc = createPC(peer);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Tell the caller we answered
    socket.emit("call:answer", {
      to: peer,
      from: selfUsernameRef.current,
      answer,
    });

    callStateRef.current = "active";
    setCallState("active");
    startTimer();
    // Re-apply in case ontrack fired before video element was visible
    setTimeout(() => {
      if (
        remoteStreamRef.current &&
        callTypeRef.current === "video" &&
        remoteVideoRef.current
      ) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    }, 50);
  }, [cleanupCall, createPC]);

  // ── Reject / End ──────────────────────────────────────────────────────────
  const rejectCall = useCallback(() => {
    socket.emit("call:reject", {
      to: callPeerRef.current,
      from: selfUsernameRef.current,
    });
    cleanupCall();
  }, [cleanupCall]);

  const endCall = useCallback(() => {
    socket.emit("call:end", {
      to: callPeerRef.current,
      from: selfUsernameRef.current,
    });
    cleanupCall();
  }, [cleanupCall]);

  // ── Toggle mute / cam ─────────────────────────────────────────────────────
  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((m) => !m);
  };

  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCamOff((c) => !c);
  };

  // ── Socket.IO listeners — registered ONCE, use refs for current values ────
  useEffect(() => {
    // Callee receives incoming call
    const onIncoming = ({ from, callType: type, offer }) => {
      console.log("call:incoming from", from);
      if (callStateRef.current !== "idle") {
        // Already in a call — auto-reject
        socket.emit("call:reject", { to: from, from: selfUsernameRef.current });
        return;
      }
      incomingOfferRef.current = offer;
      callPeerRef.current = from;
      callTypeRef.current = type;
      callStateRef.current = "incoming";
      setCallPeer(from);
      setCallType(type);
      setCallState("incoming");
    };

    // ── THIS IS THE KEY FIX ──
    // Caller receives the answer from callee.
    // Because we use pcRef (a ref), this handler always sees the latest PC
    // even though it was registered only once.
    const onAnswered = async ({ answer }) => {
      console.log("call:answered received — setting remote description");
      const pc = pcRef.current;
      if (!pc) {
        console.warn("call:answered: no peer connection");
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        // Transition Ansh from "outgoing" → "active"
        callStateRef.current = "active";
        setCallState("active");
        startTimer();
        // Re-apply remote stream in case ontrack fired before video el was visible
        setTimeout(() => {
          if (
            remoteStreamRef.current &&
            callTypeRef.current === "video" &&
            remoteVideoRef.current
          ) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }
        }, 50);
        console.log("Caller is now ACTIVE");
      } catch (err) {
        console.error("setRemoteDescription failed:", err);
      }
    };

    const onRejected = () => {
      console.log("call:rejected");
      cleanupCall();
      alert("Call was declined.");
    };

    const onEnded = () => {
      console.log("call:ended");
      cleanupCall();
    };

    const onIce = async ({ candidate }) => {
      const pc = pcRef.current;
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("ICE add error:", e);
        }
      }
    };

    const onError = ({ message }) => {
      alert("Call error: " + message);
      cleanupCall();
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:answered", onAnswered);
    socket.on("call:rejected", onRejected);
    socket.on("call:ended", onEnded);
    socket.on("call:ice", onIce);
    socket.on("call:error", onError);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:answered", onAnswered);
      socket.off("call:rejected", onRejected);
      socket.off("call:ended", onEnded);
      socket.off("call:ice", onIce);
      socket.off("call:error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← empty deps: register once. Refs always have latest values.

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .mc-root{display:flex;height:100vh;width:100vw;background:#f0f2f8;font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative;}
        .mc-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
        .mc-bg-orb{position:absolute;border-radius:9999px;}
        .mc-bg-orb-1{width:55vw;height:55vw;top:-20%;left:-10%;background:radial-gradient(circle,rgba(70,71,211,0.18) 0%,transparent 70%);filter:blur(60px);animation:mc-breathe 8s ease-in-out infinite;}
        .mc-bg-orb-2{width:40vw;height:40vw;bottom:-15%;right:-5%;background:radial-gradient(circle,rgba(184,4,56,0.13) 0%,transparent 70%);filter:blur(60px);animation:mc-breathe 10s ease-in-out infinite reverse;}
        @keyframes mc-breathe{0%,100%{transform:scale(1);opacity:0.8;}50%{transform:scale(1.08);opacity:1;}}
        @keyframes mc-blink{0%,100%{opacity:1;}50%{opacity:0.25;}}
        @keyframes mc-ring{0%{box-shadow:0 0 0 0 rgba(70,71,211,0.6);}70%{box-shadow:0 0 0 22px rgba(70,71,211,0);}100%{box-shadow:0 0 0 0 rgba(70,71,211,0);}}
        @keyframes mc-slide-up{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}

        .msym{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24;display:inline-block;vertical-align:middle;line-height:1;}

        /* ── CALL OVERLAY ── */
        .call-overlay{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;animation:mc-slide-up 0.3s cubic-bezier(0.23,1,0.32,1);}
        .call-backdrop{position:absolute;inset:0;background:rgba(8,8,20,0.85);backdrop-filter:blur(24px);}
        .call-card{position:relative;z-index:1;width:360px;border-radius:36px;overflow:hidden;background:linear-gradient(160deg,#16163a 0%,#1a1240 55%,#0d1a14 100%);box-shadow:0 40px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.06);padding:44px 32px 40px;display:flex;flex-direction:column;align-items:center;}

        /* video layout on top of card */
        .call-videos{position:absolute;inset:0;}
        .call-video-remote{width:100%;height:100%;object-fit:cover;background:#000;}
        .call-video-local{position:absolute;bottom:200px;right:14px;width:96px;height:136px;border-radius:16px;object-fit:cover;background:#111;border:2px solid rgba(255,255,255,0.15);box-shadow:0 4px 20px rgba(0,0,0,0.5);}
        .call-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;width:100%;}

        .call-av{width:90px;height:90px;border-radius:28px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;box-shadow:0 4px 24px rgba(0,0,0,0.4);margin-bottom:22px;flex-shrink:0;}
        .call-av.ringing{animation:mc-ring 1.4s ease-out infinite;}

        .call-name{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;letter-spacing:-0.03em;color:#fff;margin-bottom:6px;text-align:center;}
        .call-badge{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:9999px;padding:5px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.45);margin-bottom:22px;}
        .call-status{font-size:14px;font-weight:500;color:rgba(255,255,255,0.45);margin-bottom:36px;display:flex;align-items:center;gap:8px;letter-spacing:0.04em;}
        .call-status-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;animation:mc-blink 1s infinite;}

        .call-actions{display:flex;gap:18px;align-items:flex-end;justify-content:center;}
        .call-btn{display:flex;flex-direction:column;align-items:center;gap:8px;border:none;background:none;padding:0;cursor:pointer;}
        .call-btn-circle{width:64px;height:64px;border-radius:9999px;display:flex;align-items:center;justify-content:center;transition:all 0.2s cubic-bezier(0.23,1,0.32,1);}
        .call-btn:hover .call-btn-circle{transform:scale(1.1);}
        .call-btn:active .call-btn-circle{transform:scale(0.9);}
        .call-btn-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);}
        .btn-end .call-btn-circle{background:linear-gradient(135deg,#e11d48,#be123c);box-shadow:0 6px 22px rgba(225,29,72,0.55);}
        .btn-accept .call-btn-circle{background:linear-gradient(135deg,#059669,#047857);box-shadow:0 6px 22px rgba(5,150,105,0.55);}
        .btn-toggle .call-btn-circle{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);}
        .btn-toggle.on .call-btn-circle{background:rgba(255,255,255,0.22);}

        /* ── SIDEBAR ── */
        .mc-sidebar{width:340px;min-width:280px;display:flex;flex-direction:column;background:rgba(255,255,255,0.62);backdrop-filter:blur(48px);border-right:1px solid rgba(255,255,255,0.6);box-shadow:4px 0 40px rgba(70,71,211,0.06);position:relative;z-index:2;}
        .mc-sb-top{padding:28px 24px 20px;}
        .mc-sb-brand{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.03em;color:#4647d3;margin-bottom:20px;display:flex;align-items:center;gap:8px;}
        .mc-sb-brand-dot{width:8px;height:8px;border-radius:9999px;background:linear-gradient(135deg,#4647d3,#b80438);animation:mc-blink 2s infinite;}
        .mc-self-card{background:linear-gradient(135deg,rgba(70,71,211,0.08),rgba(184,4,56,0.05));border:1px solid rgba(70,71,211,0.1);border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;}
        .mc-self-card-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#abadaf;margin-bottom:2px;}
        .mc-self-card-name{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;letter-spacing:-0.02em;color:#2c2f31;}
        .mc-self-card-status{display:flex;align-items:center;gap:5px;font-size:11px;color:#006947;font-weight:600;margin-top:2px;}
        .mc-peers-label{padding:16px 24px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#abadaf;display:flex;align-items:center;justify-content:space-between;}
        .mc-peers-count{background:rgba(70,71,211,0.08);color:#4647d3;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;}
        .mc-userlist{flex:1;overflow-y:auto;padding:0 12px 16px;}
        .mc-userlist::-webkit-scrollbar{width:0;}
        .mc-user-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;cursor:pointer;margin-bottom:4px;position:relative;transition:all 0.25s cubic-bezier(0.23,1,0.32,1);}
        .mc-user-row:hover{background:rgba(70,71,211,0.06);transform:translateX(2px);}
        .mc-user-row.active{background:linear-gradient(135deg,rgba(70,71,211,0.12),rgba(70,71,211,0.06));box-shadow:0 2px 16px rgba(70,71,211,0.1);}
        .mc-user-row.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:0 3px 3px 0;background:linear-gradient(#4647d3,#b80438);}
        .mc-user-row-info{flex:1;min-width:0;}
        .mc-user-row-name{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;letter-spacing:-0.01em;color:#2c2f31;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .mc-user-row.active .mc-user-row-name{color:#4647d3;}
        .mc-user-row-phone{font-size:12px;color:#747779;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .mc-call-btns{display:flex;gap:4px;flex-shrink:0;opacity:0;transform:translateX(6px);transition:opacity 0.2s,transform 0.2s;pointer-events:none;}
        .mc-user-row:hover .mc-call-btns,.mc-user-row.active .mc-call-btns{opacity:1;transform:translateX(0);pointer-events:auto;}
        .mc-call-btn{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:all 0.2s cubic-bezier(0.23,1,0.32,1);flex-shrink:0;}
        .mc-call-btn-voice{background:rgba(0,105,71,0.1);color:#006947;}
        .mc-call-btn-voice:hover{background:linear-gradient(135deg,#006947,#059669);color:#fff;transform:scale(1.12);box-shadow:0 4px 14px rgba(0,105,71,0.35);}
        .mc-call-btn-video{background:rgba(70,71,211,0.1);color:#4647d3;}
        .mc-call-btn-video:hover{background:linear-gradient(135deg,#4647d3,#6366f1);color:#fff;transform:scale(1.12);box-shadow:0 4px 14px rgba(70,71,211,0.35);}
        .mc-user-row-badge{width:7px;height:7px;border-radius:9999px;background:rgba(0,105,71,0.5);flex-shrink:0;}
        .mc-av{border-radius:14px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.12);}

        /* ── MAIN ── */
        .mc-main{flex:1;display:flex;flex-direction:column;position:relative;z-index:1;overflow:hidden;}
        .mc-topbar{padding:18px 32px;display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.55);backdrop-filter:blur(32px);border-bottom:1px solid rgba(255,255,255,0.5);box-shadow:0 2px 20px rgba(0,0,0,0.04);flex-shrink:0;}
        .mc-topbar-info{flex:1;}
        .mc-topbar-name{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.03em;color:#2c2f31;}
        .mc-topbar-sub{font-size:12px;color:#747779;display:flex;align-items:center;gap:6px;margin-top:3px;}
        .mc-topbar-dot{width:7px;height:7px;border-radius:9999px;background:#006947;animation:mc-blink 2s ease-in-out infinite;}
        .mc-topbar-actions{display:flex;gap:8px;align-items:center;}
        .mc-topbar-call{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:9999px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;transition:all 0.25s cubic-bezier(0.23,1,0.32,1);}
        .mc-topbar-call-voice{background:rgba(0,105,71,0.08);border:1px solid rgba(0,105,71,0.15);color:#006947;}
        .mc-topbar-call-voice:hover{background:linear-gradient(135deg,#006947,#059669);border-color:transparent;color:#fff;box-shadow:0 4px 16px rgba(0,105,71,0.3);transform:scale(1.04);}
        .mc-topbar-call-video{background:rgba(70,71,211,0.08);border:1px solid rgba(70,71,211,0.15);color:#4647d3;}
        .mc-topbar-call-video:hover{background:linear-gradient(135deg,#4647d3,#6366f1);border-color:transparent;color:#fff;box-shadow:0 4px 16px rgba(70,71,211,0.3);transform:scale(1.04);}
        .mc-topbar-pill{display:flex;align-items:center;gap:6px;background:rgba(70,71,211,0.07);border:1px solid rgba(70,71,211,0.12);padding:7px 14px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#4647d3;}

        .mc-msgs{flex:1;overflow-y:auto;padding:32px 40px;display:flex;flex-direction:column;gap:4px;}
        .mc-msgs::-webkit-scrollbar{width:5px;}
        .mc-msgs::-webkit-scrollbar-thumb{background:rgba(171,173,175,0.25);border-radius:3px;}
        .mc-bubble-row{display:flex;align-items:flex-end;gap:10px;margin-bottom:3px;}
        .mc-bubble-row.self{flex-direction:row-reverse;}
        .mc-bubble{max-width:62%;padding:13px 18px;border-radius:22px;word-break:break-word;transition:transform 0.15s;}
        .mc-bubble:hover{transform:scale(1.01);}
        .mc-bubble.other{background:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.8);box-shadow:0 4px 20px rgba(0,0,0,0.06);border-bottom-left-radius:5px;}
        .mc-bubble.self{background:linear-gradient(135deg,#4647d3,#3939c7);box-shadow:0 6px 24px rgba(70,71,211,0.3);border-bottom-right-radius:5px;}
        .mc-bubble-text{font-size:15px;line-height:1.55;}
        .mc-bubble.other .mc-bubble-text{color:#2c2f31;}
        .mc-bubble.self .mc-bubble-text{color:#f4f1ff;}
        .mc-bubble-meta{display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:5px;}
        .mc-bubble-time{font-size:10px;opacity:0.45;}
        .mc-bubble.other .mc-bubble-time{color:#2c2f31;}
        .mc-bubble.self .mc-bubble-time{color:#f4f1ff;}
        .mc-mini-av{width:32px;height:32px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.1);}
        .mc-mini-av-spacer{width:32px;flex-shrink:0;}
        .mc-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;}
        .mc-empty-ring{width:100px;height:100px;border-radius:32px;background:linear-gradient(135deg,rgba(70,71,211,0.08),rgba(184,4,56,0.05));border:2px solid rgba(70,71,211,0.1);display:flex;align-items:center;justify-content:center;animation:mc-breathe 4s ease-in-out infinite;}
        .mc-empty-title{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.03em;color:#595c5e;}
        .mc-empty-sub{font-family:'Newsreader',serif;font-style:italic;font-size:16px;color:#abadaf;text-align:center;max-width:300px;line-height:1.6;}
        .mc-empty-pills{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:8px;}
        .mc-empty-pill{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.7);border:1px solid rgba(171,173,175,0.15);border-radius:9999px;padding:6px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#595c5e;}
        .mc-inputbar{padding:18px 32px;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.55);backdrop-filter:blur(32px);border-top:1px solid rgba(255,255,255,0.5);box-shadow:0 -2px 20px rgba(0,0,0,0.03);flex-shrink:0;}
        .mc-input-shell{flex:1;display:flex;align-items:center;background:rgba(255,255,255,0.85);border:1.5px solid rgba(171,173,175,0.18);border-radius:18px;padding:0 18px;transition:border-color 0.2s,box-shadow 0.2s;box-shadow:0 2px 12px rgba(0,0,0,0.04);}
        .mc-input-shell:focus-within{border-color:rgba(70,71,211,0.35);box-shadow:0 0 0 4px rgba(70,71,211,0.07);}
        .mc-input-shell .msym{color:#abadaf;font-size:20px;}
        .mc-input{flex:1;border:none;background:transparent;outline:none;padding:15px 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;color:#2c2f31;}
        .mc-input::placeholder{color:#c4c6c8;}
        .mc-send{width:50px;height:50px;border-radius:16px;flex-shrink:0;background:linear-gradient(135deg,#4647d3,#3939c7);color:#f4f1ff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(70,71,211,0.35);transition:all 0.25s cubic-bezier(0.23,1,0.32,1);}
        .mc-send:hover{transform:scale(1.08) rotate(-5deg);box-shadow:0 10px 28px rgba(70,71,211,0.45);}
        .mc-send:active{transform:scale(0.94);}
        .mc-send:disabled{opacity:0.35;cursor:not-allowed;transform:none;box-shadow:none;}
      `}</style>

      {/* Hidden audio element for remote audio (voice calls) */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        style={{ display: "none" }}
      />

      {/* ── CALL OVERLAY ── */}
      {callState !== "idle" && (
        <div className="call-overlay">
          <div className="call-backdrop" />
          <div className="call-card">
            {/* Video elements — always in DOM so refs are always valid.
                Hidden via display:none when not a video call or not active. */}
            <div
              className="call-videos"
              style={{
                display:
                  callType === "video" && callState === "active"
                    ? "flex"
                    : "none",
              }}
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="call-video-remote"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="call-video-local"
              />
            </div>

            <div className="call-content">
              <div
                className={`call-av${callState === "incoming" ? " ringing" : ""}`}
                style={{
                  background: getPalette(callPeer).bg,
                  color: getPalette(callPeer).text,
                }}
              >
                {getInitial(callPeer)}
              </div>

              <div className="call-name">{callPeer}</div>

              <div className="call-badge">
                <span className="msym" style={{ fontSize: 13 }}>
                  {callType === "video" ? "videocam" : "call"}
                </span>
                {callType === "video" ? "Video Call" : "Voice Call"}
              </div>

              <div className="call-status">
                {callState === "outgoing" && (
                  <>
                    <span className="msym" style={{ fontSize: 14 }}>
                      phone_forwarded
                    </span>{" "}
                    Calling…
                  </>
                )}
                {callState === "incoming" && (
                  <>
                    <span className="msym" style={{ fontSize: 14 }}>
                      phone_in_talk
                    </span>{" "}
                    Incoming call
                  </>
                )}
                {callState === "active" && (
                  <>
                    <div className="call-status-dot" />
                    {formatDuration(callDuration)}
                  </>
                )}
              </div>

              <div className="call-actions">
                {/* ACTIVE state */}
                {callState === "active" && (
                  <>
                    <button
                      className={`call-btn btn-toggle${isMuted ? " on" : ""}`}
                      onClick={toggleMute}
                    >
                      <div className="call-btn-circle">
                        <span
                          className="msym"
                          style={{ fontSize: 26, color: "#fff" }}
                        >
                          {isMuted ? "mic_off" : "mic"}
                        </span>
                      </div>
                      <span className="call-btn-label">
                        {isMuted ? "Unmute" : "Mute"}
                      </span>
                    </button>

                    {callType === "video" && (
                      <button
                        className={`call-btn btn-toggle${isCamOff ? " on" : ""}`}
                        onClick={toggleCam}
                      >
                        <div className="call-btn-circle">
                          <span
                            className="msym"
                            style={{ fontSize: 26, color: "#fff" }}
                          >
                            {isCamOff ? "videocam_off" : "videocam"}
                          </span>
                        </div>
                        <span className="call-btn-label">
                          {isCamOff ? "Cam On" : "Cam Off"}
                        </span>
                      </button>
                    )}

                    <button className="call-btn btn-end" onClick={endCall}>
                      <div className="call-btn-circle">
                        <span
                          className="msym"
                          style={{ fontSize: 26, color: "#fff" }}
                        >
                          call_end
                        </span>
                      </div>
                      <span className="call-btn-label">End</span>
                    </button>
                  </>
                )}

                {/* OUTGOING state */}
                {callState === "outgoing" && (
                  <button className="call-btn btn-end" onClick={endCall}>
                    <div className="call-btn-circle">
                      <span
                        className="msym"
                        style={{ fontSize: 26, color: "#fff" }}
                      >
                        call_end
                      </span>
                    </div>
                    <span className="call-btn-label">Cancel</span>
                  </button>
                )}

                {/* INCOMING state */}
                {callState === "incoming" && (
                  <>
                    <button className="call-btn btn-end" onClick={rejectCall}>
                      <div className="call-btn-circle">
                        <span
                          className="msym"
                          style={{ fontSize: 26, color: "#fff" }}
                        >
                          call_end
                        </span>
                      </div>
                      <span className="call-btn-label">Decline</span>
                    </button>
                    <button
                      className="call-btn btn-accept"
                      onClick={answerCall}
                    >
                      <div className="call-btn-circle">
                        <span
                          className="msym"
                          style={{ fontSize: 26, color: "#fff" }}
                        >
                          call
                        </span>
                      </div>
                      <span className="call-btn-label">Accept</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── APP SHELL ── */}
      <div className="mc-root">
        <div className="mc-bg">
          <div className="mc-bg-orb mc-bg-orb-1" />
          <div className="mc-bg-orb mc-bg-orb-2" />
        </div>

        {/* SIDEBAR */}
        <aside className="mc-sidebar">
          <div className="mc-sb-top">
            <div className="mc-sb-brand">
              <div className="mc-sb-brand-dot" /> MeshChat
            </div>
            <div className="mc-self-card">
              <div
                className="mc-av"
                style={{
                  width: 44,
                  height: 44,
                  fontSize: 18,
                  background: getPalette(selfUsername).bg,
                  color: getPalette(selfUsername).text,
                }}
              >
                {getInitial(selfUsername)}
              </div>
              <div>
                <div className="mc-self-card-label">You</div>
                <div className="mc-self-card-name">{selfUsername || "—"}</div>
                <div className="mc-self-card-status">
                  <span
                    className="msym"
                    style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}
                  >
                    circle
                  </span>
                  Online
                </div>
              </div>
            </div>
          </div>

          <div className="mc-peers-label">
            Peers
            <span className="mc-peers-count">
              {users.filter((u) => u.username !== selfUsername).length}
            </span>
          </div>

          <div className="mc-userlist">
            {users
              .filter((u) => u.username !== selfUsername)
              .map((user, i) => {
                const p = getPalette(user.username);
                return (
                  <div
                    key={i}
                    className={`mc-user-row${selectedUser === user.username ? " active" : ""}`}
                    onClick={() => getMessages(user.username)}
                  >
                    <div
                      className="mc-av"
                      style={{
                        width: 44,
                        height: 44,
                        fontSize: 17,
                        background: p.bg,
                        color: p.text,
                      }}
                    >
                      {getInitial(user.username)}
                    </div>
                    <div className="mc-user-row-info">
                      <div className="mc-user-row-name">{user.username}</div>
                      <div className="mc-user-row-phone">{user.phone}</div>
                    </div>
                    <div className="mc-call-btns">
                      <button
                        className="mc-call-btn mc-call-btn-voice"
                        onClick={(e) => {
                          e.stopPropagation();
                          startCall(user.username, "voice");
                        }}
                      >
                        <span className="msym" style={{ fontSize: 16 }}>
                          call
                        </span>
                      </button>
                      <button
                        className="mc-call-btn mc-call-btn-video"
                        onClick={(e) => {
                          e.stopPropagation();
                          startCall(user.username, "video");
                        }}
                      >
                        <span className="msym" style={{ fontSize: 16 }}>
                          videocam
                        </span>
                      </button>
                    </div>
                    <div className="mc-user-row-badge" />
                  </div>
                );
              })}
          </div>
        </aside>

        {/* MAIN */}
        <main className="mc-main">
          {selectedUser ? (
            <>
              <div className="mc-topbar">
                <div
                  className="mc-av"
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 20,
                    background: getPalette(selectedUser).bg,
                    color: getPalette(selectedUser).text,
                  }}
                >
                  {getInitial(selectedUser)}
                </div>
                <div className="mc-topbar-info">
                  <div className="mc-topbar-name">{selectedUser}</div>
                  <div className="mc-topbar-sub">
                    <div className="mc-topbar-dot" />
                    E2E Encrypted · Mesh Routed
                  </div>
                </div>
                <div className="mc-topbar-actions">
                  <button
                    className="mc-topbar-call mc-topbar-call-voice"
                    onClick={() => startCall(selectedUser, "voice")}
                  >
                    <span className="msym" style={{ fontSize: 16 }}>
                      call
                    </span>{" "}
                    Voice
                  </button>
                  <button
                    className="mc-topbar-call mc-topbar-call-video"
                    onClick={() => startCall(selectedUser, "video")}
                  >
                    <span className="msym" style={{ fontSize: 16 }}>
                      videocam
                    </span>{" "}
                    Video
                  </button>
                </div>
                <div className="mc-topbar-pill">
                  <span className="msym" style={{ fontSize: 14 }}>
                    lock
                  </span>{" "}
                  Secure
                </div>
              </div>

              <div className="mc-msgs">
                {messages.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: 48,
                      fontFamily: "Newsreader",
                      fontStyle: "italic",
                      color: "#c4c6c8",
                      fontSize: 18,
                    }}
                  >
                    No messages yet — say hello!
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isSelf = msg.sender === selfUsername;
                  const p = getPalette(msg.sender);
                  const showAvatar =
                    !isSelf &&
                    (i === 0 || messages[i - 1]?.sender !== msg.sender);
                  return (
                    <div
                      key={i}
                      className={`mc-bubble-row${isSelf ? " self" : ""}`}
                    >
                      {!isSelf ? (
                        showAvatar ? (
                          <div
                            className="mc-mini-av"
                            style={{ background: p.bg, color: p.text }}
                          >
                            {getInitial(msg.sender)}
                          </div>
                        ) : (
                          <div className="mc-mini-av-spacer" />
                        )
                      ) : null}
                      <div
                        className={`mc-bubble${isSelf ? " self" : " other"}`}
                      >
                        <div className="mc-bubble-text">{msg.message}</div>
                        <div className="mc-bubble-meta">
                          <span className="mc-bubble-time">
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : ""}
                          </span>
                          {isSelf && (
                            <span
                              className="msym"
                              style={{
                                fontSize: 11,
                                color: "rgba(244,241,255,0.5)",
                              }}
                            >
                              done_all
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="mc-inputbar">
                <div className="mc-input-shell">
                  <span className="msym">mood</span>
                  <input
                    className="mc-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message across the mesh…"
                  />
                  <span
                    className="msym"
                    style={{ cursor: "pointer", color: "#abadaf" }}
                  >
                    attach_file
                  </span>
                </div>
                <button
                  className="mc-send"
                  onClick={send}
                  disabled={!text.trim()}
                >
                  <span
                    className="msym"
                    style={{
                      fontSize: 22,
                      color: "#f4f1ff",
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    send
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="mc-empty">
              <div className="mc-empty-ring">
                <span
                  className="msym"
                  style={{ fontSize: 44, color: "#4647d3" }}
                >
                  hub
                </span>
              </div>
              <div className="mc-empty-title">Pick a peer to connect</div>
              <div className="mc-empty-sub">
                Your messages travel encrypted across every hop of the mesh —
                private by design.
              </div>
              <div className="mc-empty-pills">
                {[
                  { icon: "lock", label: "E2E Encrypted" },
                  { icon: "route", label: "Mesh Routed" },
                  { icon: "visibility_off", label: "No Metadata" },
                ].map((p) => (
                  <div className="mc-empty-pill" key={p.label}>
                    <span
                      className="msym"
                      style={{ fontSize: 13, color: "#4647d3" }}
                    >
                      {p.icon}
                    </span>
                    {p.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
