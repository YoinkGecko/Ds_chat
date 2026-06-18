I'll explore the project structure and key files first so the README reflects what this repo actually does.

# Ds Chat
A distributed chat application with load balancing, real-time messaging, and WebRTC voice/video calls. The backend runs as multiple Express instances behind a custom load balancer that routes traffic based on CPU and memory metrics.
## Features
- **User authentication** — Sign up and log in with username, phone, and password
- **Direct messaging** — Send and receive messages between users
- **Load balancing** — Requests are routed to the healthiest backend server
- **Server monitoring** — Live dashboard showing load scores and server status
- **Failover** — Automatically spins up backup servers when an instance goes down
- **Voice & video calls** — WebRTC peer-to-peer calls with Socket.IO signaling
- **Offline support** — Messages are queued locally and synced when back online
## Architecture
```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────────────┐
│  React App  │────▶│  Load Balancer   │────▶│  Backend Servers            │
│  (Vite)     │     │  LB.js :4000     │     │  server.js :5001/:5002/:5003│
└─────────────┘     └──────────────────┘     └─────────────────────────────┘
       │                     │                            │
       │                     │                            ▼
       │                     │                     ┌─────────────┐
       └─────────────────────┴────────────────────▶│   MySQL     │
              Socket.IO signaling                  │  (wechat)   │
                                                   └─────────────┘
```
| Component | File | Port | Role |
|-----------|------|------|------|
| Load balancer | `LB.js` | 4000 | Auth, signaling, routing, monitoring |
