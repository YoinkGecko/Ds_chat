const express = require("express");
const os = require("os");
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "wechat"
});

const app = express();
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});