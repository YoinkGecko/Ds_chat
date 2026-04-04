const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");
const { exec } = require("child_process");
const http = require("http");
const { Server } = require("socket.io");

let BackUpPort = 6000;

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "wechat",
});

const servers = [
  "http://localhost:5001",
  "http://localhost:5002",
  "http://localhost:5003",
];

function calculateScore(cpu, memory) {
  const normalizedMemory = 1 / memory;
  return cpu * 0.7 + normalizedMemory * 0.3;
}

let history = {
  "http://localhost:5001": [],
  "http://localhost:5002": [],
  "http://localhost:5003": [],
};

const MAX_POINTS = 50;
let serverStatus = servers.map((url) => ({ url, status: "active" }));

setInterval(async () => {
  for (const server of serverStatus) {
    try {
      const res = await axios.get(`${server.url}/test`, { timeout: 2000 });
      if (res.data) {
        server.status = "active";
      } else {
        throw new Error("No data received");
      }
    } catch (err) {
      if (server.status !== "down") {
        server.status = "down";
        console.error(`${server.url} is DOWN: ${new Date()}`);
        const currentBackup = BackUpPort;
        exec(`node server.js ${currentBackup}`, (error) => {
          if (error)
            console.error(`Execution error on port ${currentBackup}: ${error.message}`);
        });
        BackUpPort++;
      } else {
        console.log(`${server.url} is still down. Waiting for recovery...`);
      }
    }
  }
}, 1000);

setInterval(async () => {
  await Promise.all(
    servers.map(async (server) => {
      try {
        const res = await axios.get(`${server}/metrics`, { timeout: 4000 });
        const { cpu, memory } = res.data;
        const score = calculateScore(cpu, memory);
        history[server].push({ time: Date.now(), score });
        if (history[server].length > MAX_POINTS) history[server].shift();
      } catch (err) {}
    })
  );
}, 3000);

function getBestServer() {
  let best = null;
  let minScore = Infinity;
  for (let server of servers) {
    const data = history[server];
    if (data.length === 0) continue;
    const latest = data[data.length - 1];
    if (latest.score < minScore) {
      minScore = latest.score;
      best = server;
    }
  }
  return best;
}

app.get("/stats", (req, res) => res.json(history));
app.get("/bs", (req, res) => {
  const server = getBestServer();
  if (!server) return res.status(500).json({ error: "No servers available" });
  res.json({ bestServer: server });
});
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "serverstats.html"))
);
app.post("/signup", async (req, res) => {
  const { phone, username, password } = req.body;
  if (!phone || !username || !password)
    return res.status(400).json({ error: "All fields required" });
  try {
    await db.query(
      "INSERT INTO users (phone, username, password) VALUES (?, ?, ?)",
      [phone, username, password]
    );
    res.json({ message: "User created" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Username already exists" });
    res.status(500).json({ error: "DB error" });
  }
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (rows.length === 0)
      return res.status(400).json({ error: "User not found" });
    const user = rows[0];
    if (user.password !== password)
      return res.status(400).json({ error: "Invalid password" });
    res.json({ message: "Login success" });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// ── Socket.IO signaling ───────────────────────────────────────────────────────
const onlineUsers = new Map(); // username → socket.id

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (username) => {
    onlineUsers.set(username, socket.id);
    socket.data.username = username;
    console.log(`Registered: ${username} → ${socket.id}`);
  });

  // Caller → callee: SDP offer
  socket.on("call:invite", ({ to, from, callType, offer }) => {
    console.log(`call:invite  from=${from}  to=${to}  type=${callType}`);
    const dst = onlineUsers.get(to);
    if (!dst) {
      socket.emit("call:error", { message: `${to} is not online` });
      return;
    }
    io.to(dst).emit("call:incoming", { from, callType, offer });
  });

  // Callee → caller: SDP answer  (MUST carry `from` so caller knows who answered)
  socket.on("call:answer", ({ to, from, answer }) => {
    console.log(`call:answer  from=${from}  to=${to}`);
    const dst = onlineUsers.get(to);
    if (dst) io.to(dst).emit("call:answered", { from, answer });
  });

  // Callee rejects
  socket.on("call:reject", ({ to, from }) => {
    console.log(`call:reject  from=${from}  to=${to}`);
    const dst = onlineUsers.get(to);
    if (dst) io.to(dst).emit("call:rejected", { from });
  });

  // Either side hangs up
  socket.on("call:end", ({ to, from }) => {
    console.log(`call:end  from=${from}  to=${to}`);
    const dst = onlineUsers.get(to);
    if (dst) io.to(dst).emit("call:ended", { from });
  });

  // ICE candidate relay
  socket.on("call:ice", ({ to, from, candidate }) => {
    const dst = onlineUsers.get(to);
    if (dst) io.to(dst).emit("call:ice", { from, candidate });
  });

  socket.on("disconnect", () => {
    if (socket.data.username) {
      if (onlineUsers.get(socket.data.username) === socket.id) {
        onlineUsers.delete(socket.data.username);
        console.log(`Unregistered: ${socket.data.username}`);
      }
    }
  });
});

httpServer.listen(4000, () =>
  console.log("LB + signaling running on port 4000")
);