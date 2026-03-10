# VajraGuard 🛡️
### AI-Powered Autonomous Security Operations Center

> **API Innovate 2026 Hackathon** — Built with the ASI-1 AI API

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://mongodb.com)
[![ASI-1](https://img.shields.io/badge/ASI--1-AI%20Powered-blue)](https://asi1.ai)

---

## 🌟 What is VajraGuard?

VajraGuard is a production-quality **AI-powered Security Operations Center (SOC)** platform that monitors, analyzes, and responds to cybersecurity threats in real time.

It combines:
- **Rule-based threat correlation** for fast pattern detection
- **ASI-1 AI** for deep contextual threat analysis and recommendations
- **Live visualizations** for SOC dashboards, threat maps, and attack graphs

> Inspired by platforms like CrowdStrike Falcon, Microsoft Sentinel, and Splunk SIEM.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📤 **Log Ingestion** | Upload `.log` / `.txt` files (SSH, web server, firewall) |
| 🧠 **AI Threat Analysis** | ASI-1 analyzes events and generates security reports |
| 🗺️ **Global Threat Map** | Leaflet.js map showing attack origins worldwide |
| 📊 **Attack Timeline** | Recharts area chart of events over time |
| 🕸️ **Attack Graph** | React Flow visualization of attack chains |
| 💬 **AI Assistant** | Chat interface powered by ASI-1 |
| 🎭 **Demo Simulation** | Generate realistic fake attack logs with one click |
| 🛡️ **Defense Suggestions** | AI-recommended actions for every detected threat |

---

## 🏗️ Architecture

```
vajraguard/
├── backend/                 # Node.js + Express API
│   ├── controllers/         # Request handlers
│   ├── models/              # MongoDB schemas (Log, SecurityEvent, Threat)
│   ├── routes/              # Express routes
│   ├── services/
│   │   ├── logParser.js     # Regex-based log parser
│   │   ├── threatEngine.js  # Rule-based threat correlation
│   │   ├── asiClient.js     # ASI-1 API integration
│   │   └── geoip.js         # IP geolocation
│   └── server.js            # Entry point
│
└── frontend/                # Next.js 14 App Router
    ├── app/
    │   ├── dashboard/       # Main SOC dashboard
    │   ├── upload-logs/     # Log upload + analysis
    │   ├── threat-map/      # Leaflet.js global map
    │   ├── attack-timeline/ # Recharts timeline
    │   ├── attack-graph/    # React Flow attack chains
    │   └── ai-assistant/    # ASI-1 chat interface
    ├── components/
    │   ├── Sidebar.tsx
    │   └── ThreatMapInner.tsx
    └── lib/api.ts           # API client
```

---

## 🤖 ASI-1 API Integration

VajraGuard uses ASI-1 in two key workflows:

### 1. Automatic Threat Analysis (after log upload or simulation)
```
POST /api/logs/upload → logParser → threatEngine → ASI-1 Analysis
```

The ASI-1 prompt:
```
You are an expert cybersecurity analyst working in a SOC.
Analyze the following security events:
[structured event list]

Return:
1. Threat Type
2. Risk Level (Low/Medium/High/Critical)
3. Attack Chain
4. Threat Actor Profile
5. Impact Assessment
6. Recommended Defensive Actions
```

### 2. Interactive AI Assistant
```
POST /api/ai/analyze + user question → ASI-1 → Markdown response
```

The AI assistant has full context of all stored security events and threats.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- ASI-1 API Key

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your ASI1_API_KEY and MONGODB_URI
npm install
npm start
# API running at http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# Dashboard at http://localhost:3000
```

---

## 🎮 Demo

### Quick Demo (no API key needed)
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Open `http://localhost:3000/dashboard`
4. Click **"Simulate Attack"** to generate fake attack data
5. Watch threats appear on the dashboard
6. Visit `/threat-map`, `/attack-timeline`, `/attack-graph`
7. Go to `/ai-assistant` and ask: _"What happened on my server today?"_

### Full Demo (with ASI-1)
1. Set `ASI1_API_KEY=your_key` in `backend/.env`
2. Upload `sample.log` at `/upload-logs`
3. See AI-powered threat analysis
4. Use AI assistant for deep security insights

---

## 📋 Detected Threat Types

| Type | Detection Rule |
|---|---|
| **Brute Force Attack** | 5+ failed logins from same IP |
| **Account Takeover** | Failed logins → successful login from same IP |
| **Port Scan** | 3+ port probe/block events from same IP |
| **Web Attack** | 10+ 404 errors or requests to sensitive paths |

---

## 🛠️ Tech Stack

**Frontend**: Next.js 14, TypeScript, TailwindCSS, Recharts, Leaflet.js, React Flow, Lucide Icons

**Backend**: Node.js, Express.js, Multer, Mongoose

**Database**: MongoDB

**AI**: ASI-1 API

**Geo**: ip-api.com (free, no key required)

---

## 📝 Sample Log Format

VajraGuard parses these log formats automatically:

```log
# SSH brute force
Mar 10 10:22:31 server sshd[4521]: Failed password for root from 185.234.218.12 port 22 ssh2
Mar 10 10:23:01 server sshd[4527]: Accepted password for root from 185.234.218.12 port 58422 ssh2

# Firewall
Mar 10 10:23:45 server kernel: [UFW BLOCK] IN=eth0 SRC=91.108.4.117 DST=10.0.1 PROTO=TCP DPT=22

# Web server (Apache/Nginx)
185.234.218.12 - - [10/Mar/2026:10:25:00 +0000] "GET /admin HTTP/1.1" 404 512
```

---

*Built for API Innovate 2026 — Demonstrating the power of ASI-1 for real-world cybersecurity applications*
