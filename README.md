# Ds Chat — Distributed Real-Time Chat Platform

A distributed real-time chat platform supporting **direct messaging**, **voice calls**, and **video calls** using WebRTC. The system runs multiple backend instances behind a custom load balancer with health monitoring, automatic failover, and a live operations dashboard.

## Highlights

- Built a distributed real-time chat platform supporting direct messaging, voice calls, and video calls using WebRTC
- Designed and implemented a custom load balancer capable of routing requests across multiple backend instances
- Developed health monitoring and failover mechanisms to detect unhealthy servers and maintain service availability
- Built a real-time monitoring dashboard displaying server load, health status, and traffic distribution metrics
- Integrated Socket.IO signaling infrastructure for WebRTC peer-to-peer voice and video communication
- Applied distributed systems concepts including load balancing, failover handling, service health checks, and horizontal scaling

## System Overview

```
┌────────────────────┐
│   React Frontend   │  Messaging, auth UI, WebRTC client
│   (Vite + React)   │
└─────────┬──────────┘
          │  REST + Socket.IO
          ▼
┌────────────────────┐
│   Load Balancer    │  Auth, signaling, routing, monitoring
│   LB.js  :4000     │
└─────────┬──────────┘
          │  Routes to least-loaded instance
          ▼
┌─────────────────────────────────────────────┐
│  Backend Servers (server.js)                │
│  :5001  :5002  :5003  (+ backup :6000+)     │
│  Messaging API · CPU/memory metrics         │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
               ┌─────────────┐
               │   MySQL     │
               │  (wechat)   │
               └─────────────┘
```

| Component | File | Default Port | Responsibility |
|-----------|------|--------------|----------------|
| Frontend | `frontend/wechat/` | 5173 | Chat UI, calls, offline queue |
| Load balancer | `LB.js` | 4000 | Routing, auth, signaling, dashboard |
| Chat servers | `server.js` | 5001–5003 | Messages, users, health metrics |
| Database schema | `sq.sql` | — | Users and messages tables |

## Distributed Systems Design

### Custom Load Balancer

The load balancer (`LB.js`) polls each backend instance every 4 seconds for CPU and memory metrics via `/metrics`. It computes a weighted load score:

```
score = (cpu × 0.7) + (normalizedMemory × 0.3)
```

When the frontend needs to send or fetch messages, it calls `GET /bs` to receive the URL of the **least-loaded** server. This enables horizontal scaling by adding more `server.js` instances and registering them in the `servers` array.

### Health Checks & Failover

Every 5 seconds, the load balancer pings each server at `/test`. If a server fails to respond:

1. Its status is marked **down** in the health registry
2. A backup instance is automatically spawned on the next available port (`6000`, `6001`, …)
3. Recovery is tracked until the original server responds again

This keeps the messaging layer available even when individual nodes fail.

### Real-Time Monitoring Dashboard

Visit `http://localhost:4000` to open the monitoring dashboard (`serverstats.html`). It displays:

- **Load score over time** — line chart (Chart.js) for all backend instances
- **Server health status** — live active/down indicators per server URL
- **Traffic distribution** — comparative load across horizontally scaled nodes

Data is served by `GET /stats` (load history) and `GET /status` (health state).

### WebRTC Signaling (Socket.IO)

Voice and video calls use WebRTC for peer-to-peer media. The load balancer hosts a Socket.IO server that relays signaling messages between clients:

| Event | Purpose |
|-------|---------|
| `register` | Bind a username to a socket connection |
| `call:invite` | Caller sends SDP offer to callee |
| `call:answer` | Callee responds with SDP answer |
| `call:reject` | Callee declines the call |
| `call:end` | Either party hangs up |
| `call:ice` | Exchange ICE candidates for NAT traversal |

STUN servers (`stun.l.google.com`) are used for peer discovery; media streams flow directly between browsers.

### Messaging & Offline Resilience

- Messages are stored in MySQL and retrieved per conversation
- The React client queues unsent messages in `localStorage` when offline
- Queued messages are automatically synced to the best available server when connectivity returns

## Features

| Feature | Description |
|---------|-------------|
| User auth | Sign up and log in via the load balancer |
| Direct messaging | One-to-one chat between registered users |
| Voice calls | WebRTC audio calls with mute controls |
| Video calls | WebRTC video calls with camera toggle |
| Load balancing | CPU/memory-aware request routing |
| Health monitoring | Periodic health checks on all backends |
| Auto failover | Spawns backup servers on node failure |
| Ops dashboard | Real-time load and status visualization |
| Offline queue | Local message persistence during outages |

## Tech Stack

**Backend:** Node.js, Express, Socket.IO, MySQL2, Axios  
**Frontend:** React 19, Vite, React Router, Socket.IO Client, Axios  
**Real-time:** WebRTC (peer media), Socket.IO (signaling)  
**Monitoring:** Chart.js dashboard  
**Database:** MySQL

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+

### 1. Database

```bash
mysql -u root -p < sq.sql
```

Update the MySQL pool config in both `server.js` and `LB.js`:

```js
const db = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "your_password",
  database: "wechat",
});
```

### 2. Backend

```bash
npm install
```

Start three chat server instances (separate terminals):

```bash
node server.js 5001
node server.js 5002
node server.js 5003
```

Start the load balancer:

```bash
node LB.js
```

Open the monitoring dashboard at [http://localhost:4000](http://localhost:4000).

Update the `servers` and `history` objects in `LB.js` if your instance URLs differ:

```js
const servers = [
  "http://localhost:5001",
  "http://localhost:5002",
  "http://localhost:5003",
];
```

### 3. Frontend

```bash
cd frontend/wechat
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Point the frontend at your load balancer by updating URLs in:

- `frontend/wechat/src/pages/Login.jsx`
- `frontend/wechat/src/pages/Signup.jsx`
- `frontend/wechat/src/pages/Page.jsx`

Use `http://localhost:4000` for local development.

## API Reference

### Load Balancer (`:4000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register a new user |
| `POST` | `/login` | Authenticate a user |
| `GET` | `/bs` | Return the least-loaded backend URL |
| `GET` | `/stats` | Load score history for all servers |
| `GET` | `/status` | Health status of all servers |
| `GET` | `/` | Monitoring dashboard |

### Chat Servers (`:5001`–`:5003`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users |
| `GET` | `/messages?user1=&user2=` | Fetch a conversation |
| `POST` | `/send` | Send a message |
| `GET` | `/metrics` | CPU and memory metrics |
| `GET` | `/test` | Health check |

## Project Structure

```
Ds_chat-main/
├── LB.js                    # Load balancer, auth, WebRTC signaling, failover
├── server.js                # Horizontally scalable chat API server
├── serverstats.html         # Real-time monitoring dashboard
├── sq.sql                   # MySQL schema
├── doc.txt                  # Multi-machine / dev tunnel notes
├── package.json
└── frontend/
    └── wechat/
        └── src/
            └── pages/
                ├── Landing.jsx
                ├── Login.jsx
                ├── Signup.jsx
                └── Page.jsx   # Chat, calls, offline sync
```

## License

ISC
