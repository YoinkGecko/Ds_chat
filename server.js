const express = require("express");
const os = require("os");
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "shortline.proxy.rlwy.net",
  port: 49903,
  user: "root",
  password: "JlfFjehfWjhnfEsjAjsgJmvLjSyQXaem",
  database: "wechat",
});

const app = express();
app.use(express.json());
const PORT = process.argv[2];
const cors = require("cors");
app.use(cors({
  origin: "*"
}));

let lastIdle = 0;
let lastTotal = 0;

function getCpuLoad() {
  const cpus = os.cpus();

  let idle = 0;
  let total = 0;

  cpus.forEach(core => {
    for (let type in core.times) {
      total += core.times[type];
    }
    idle += core.times.idle;
  });

  const idleDiff = idle - lastIdle;
  const totalDiff = total - lastTotal;

  lastIdle = idle;
  lastTotal = total;

  const usage = 1 - idleDiff / totalDiff;

  return isNaN(usage) ? 0 : usage; // handle first run
}

app.get("/metrics", (req, res) => {
  res.json({
    cpu: getCpuLoad(),
    memory: os.freemem()
  });
});

app.get("/test", (req, res) => {
  res.json({
    message: `Test response from port ${PORT}`
  });
});


// get all users
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT username, phone FROM users"
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/send", async (req, res) => {
  const { sender, receiver, message } = req.body;

  if (!sender || !receiver || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await db.query(
      "INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)",
      [sender, receiver, message]
    );

    res.json({ message: "Message sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.get("/messages", async (req, res) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Missing users" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT * FROM messages
      WHERE 
        (sender = ? AND receiver = ?)
        OR
        (sender = ? AND receiver = ?)
      ORDER BY created_at ASC
      `,
      [user1, user2, user2, user1]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});