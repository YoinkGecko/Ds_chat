import { useEffect, useState } from "react";
import axios from "axios";

function Page() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selfUsername, setSelfUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const getMessages = (user) => {
    setSelectedUser(user);

    // fake messages for now
    setMessages([
      { sender: selfUsername, message: "Hi" },
      { sender: user, message: "Hello!" },
      { sender: selfUsername, message: "How are you?" },
      { sender: user, message: "Good 👍" },
    ]);
  };

  const send = () => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: selfUsername, message: text }]);

    setText("");
  };
  // fetch users (via LB → best server)
  useEffect(() => {
    setSelfUsername(localStorage.getItem("myUsername"));
    async function fetchUsers() {
      try {
        // step 1: get best server
        const lbRes = await axios.get("http://localhost:4000/bs");
        const server = lbRes.data.bestServer;

        // step 2: call that server
        const res = await axios.get(`${server}/users`);

        setUsers(res.data);
      } catch (err) {
        alert(err);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div
        style={{
          width: "30%",
          borderRight: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <h3>Hello {selfUsername}</h3>

        {users
          .filter((user) => user.username !== selfUsername)
          .map((user, index) => (
            <div
              key={index}
              onClick={() => getMessages(user.username)}
              style={{
                padding: "10px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                background:
                  selectedUser === user.username ? "#e6f7ff" : "white",
              }}
            >
              <div>
                <b>{user.username}</b>
              </div>
              <div style={{ fontSize: "12px", color: "gray" }}>
                {user.phone}
              </div>
            </div>
          ))}
      </div>

      {/* RIGHT PANEL */}
      {/* RIGHT PANEL */}
      <div
        style={{
          width: "70%",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedUser ? (
          <>
            <h3>Chat with {selectedUser}</h3>

            {/* CHAT BOX */}
            <div
              style={{
                flex: 1,
                border: "1px solid #ccc",
                padding: "10px",
                overflowY: "scroll",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf:
                      msg.sender === selfUsername ? "flex-end" : "flex-start",
                    background:
                      msg.sender === selfUsername ? "#dcf8c6" : "#f1f1f1",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    maxWidth: "60%",
                  }}
                >
                  {msg.message}
                </div>
              ))}
            </div>

            {/* INPUT AREA */}
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type message..."
                style={{ flex: 1, padding: "8px" }}
              />

              <button onClick={send}>Send</button>
            </div>
          </>
        ) : (
          <h3>Select a user to start chatting</h3>
        )}
      </div>
    </div>
  );
}

export default Page;
