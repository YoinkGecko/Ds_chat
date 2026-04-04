const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "wechat"
});

const servers = [
  "http://localhost:5001",
  "http://localhost:5002",
  "http://localhost:5003"//"https://7hfq6wdq-5003.inc1.devtunnels.ms"
];

// scoring function
function calculateScore(cpu, memory) {
  const normalizedMemory = 1 / memory;
  return cpu * 0.7 + normalizedMemory * 0.3;
}

// history store
let history = {
  "http://localhost:5001": [],
  "http://localhost:5002": [],
  "http://localhost:5003": []
};

const MAX_POINTS = 50;

let serverStatus = servers.map(url => ({
  url: url,
  status: "active" 
}));
setInterval(async () => {
  for (const server of serverStatus) {
    try {
      const res = await axios.get(`${server.url}/test`, { timeout: 2000 });
      
      if (res.data) {
        server.status = "active";
      } else {
        server.status = "down";
        console.error(`${server.url} returned no data: ${new Date()}`);
      }
      
    } catch (err) {
      server.status = "down";
      console.error(`${server.url} is DOWN: ${new Date()}`);
    }
  }

  console.log(serverStatus);
}, 1000);



// collect metrics every 100ms
setInterval(async () => {
  await Promise.all(
    servers.map(async (server) => {
      try {
        const res = await axios.get(`${server}/metrics`, { timeout: 4000 });
        const { cpu, memory } = res.data;

        const score = calculateScore(cpu, memory);

        history[server].push({
          time: Date.now(),
          score: score
        });

        if (history[server].length > MAX_POINTS) {
          history[server].shift();
        }

      } catch (err) {
        // skip if server down
      }
    })
  );
}, 3000);

// best server from cache
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

// routes
app.get("/stats", (req, res) => {
  res.json(history);
});

app.get("/bs", (req, res) => {
  const server = getBestServer();

  if (!server) {
    return res.status(500).json({ error: "No servers available" });
  }

  res.json({ bestServer: server });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "serverstats.html"));
});

app.post("/signup", async (req, res) => {
  const { phone, username, password } = req.body;

  if (!phone || !username || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    await db.query(
      "INSERT INTO users (phone, username, password) VALUES (?, ?, ?)",
      [phone, username, password]
    );

    res.json({ message: "User created" });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Username already exists"
      });
    }

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

    if (rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    res.json({ message: "Login success" });

  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

app.listen(4000, () => {
  console.log("LB running on port 4000");
});