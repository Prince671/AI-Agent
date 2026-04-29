<div align="center">

# 🤖 AI Agent

### A Tool-Using Intelligent Assistant with Voice, Streaming & Dynamic UI

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![LangChain](https://img.shields.io/badge/LangChain-Agent-1C3C3C?style=for-the-badge)](https://langchain.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

**Not just a chatbot — a tool-using intelligent assistant that reasons, acts, and responds in real time.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Roadmap](#-roadmap)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Mobile Access](#-mobile-access-same-network)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Acknowledgements](#-acknowledgements)
- [Author](#-author)
- [License](#-license)

---

## 🌟 Overview

AI Agent is a full-stack, production-ready intelligent assistant that goes beyond simple chatbot interactions. Powered by **LangChain + Mistral AI**, it reasons over your query, automatically selects the right tool, executes it, and streams back a grounded response — all in real time.

**How the agent thinks:**

```
User sends a query
        ↓
LangChain Agent analyzes intent
        ↓
Selects & calls the right tool
  (Weather / News / Stocks / Places / Currency ...)
        ↓
Tool result fed back to Mistral LLM
        ↓
Streamed response rendered in UI
  (Text / Stock Chart / Weather Widget)
```

---

## ✨ Features

### 🤖 Tool-Using AI Agent (Core)
The agent automatically selects the right tool based on your query — no manual mode switching needed.

| Tool | Trigger Example |
|---|---|
| 🌦️ **Weather** | *"What's the weather in Mumbai?"* |
| 📰 **News** | *"Latest news on AI?"* |
| 🏙️ **City Info** | *"Tell me about Tokyo"* |
| 📍 **Places** | *"Coffee shops near me"* |
| 📈 **Stock Price** | *"AAPL stock price"* |
| 💱 **Currency Conversion** | *"Convert 100 USD to INR"* |

### ⚡ Real-Time Streaming
- ChatGPT-style **character-by-character streaming** responses
- Non-blocking UI — see the answer as it's being generated
- Separate streaming endpoint (`/agent-stream`) for optimized throughput

### 🎤 Voice Assistant
- 🎙️ **Voice input** — speak your query using the Web Speech API
- 🔊 **Voice output** — AI reads its response aloud (text-to-speech)
- Fully hands-free interaction loop

### 📊 Stock Chart Visualization
- Real-time **interactive stock charts** rendered inside the chat bubble
- Built with **Chart.js + React**
- Dynamically triggered when stock queries are detected

### 💬 Persistent Chat System
| Feature | Description |
|---|---|
| Chat History | All conversations stored in MongoDB |
| Sidebar Navigation | Browse and switch between past chats |
| Auto Title Generation | Chat titles generated from first message |
| Search | Full-text search inside chat history |

### 🔐 Authentication & Security
- JWT-based registration and login
- Protected frontend routes via `ProtectedRoute` component
- All agent/chat endpoints require a valid token

### 🎨 Modern Jarvis-Style UI
- Built with **React + Tailwind CSS**
- Skeleton loading states for smooth perceived performance
- Smooth animations and dark dashboard aesthetic
- Fully responsive across desktop and mobile

---

## 🧱 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** (Vite) | UI framework with fast HMR |
| **Tailwind CSS** | Utility-first styling |
| **Chart.js** | Interactive stock chart rendering |
| **Axios** | HTTP client for API communication |
| **Web Speech API** | Browser-native voice input & output |

### Backend
| Technology | Purpose |
|---|---|
| **Flask** | Python web framework & API server |
| **MongoDB** | Chat history & user account storage |
| **PyJWT** | Token generation and validation |
| **Flask-CORS** | Cross-origin request handling |

### AI Layer
| Technology | Purpose |
|---|---|
| **LangChain** | Agent orchestration & tool management |
| **Mistral AI** | Core LLM for reasoning & responses |
| **Tavily API** | Real-time web search tool |

---

## 📂 Project Structure

```
AI-Agent/
│
├── BackEnd/
│   ├── core_agent.py           # LangChain agent definition & tool registry
│   ├── main.py                 # Flask app, routes, streaming logic
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Backend environment variables (not committed)
│
├── Frontend/
│   ├── public/
│   └── src/
│       ├── assets/             # Static images and icons
│       ├── components/
│       │   ├── api.js          # Axios API client & interceptors
│       │   ├── Chat.jsx        # Main chat interface with streaming
│       │   ├── Login.jsx       # Login form & JWT handling
│       │   ├── Register.jsx    # Registration form
│       │   ├── ProtectedRoute.jsx  # Auth-gated route wrapper
│       │   ├── StockChart.jsx  # Chart.js stock visualization
│       │   └── WeatherWidget.jsx   # Inline weather card component
│       ├── routes/             # React Router route definitions
│       ├── styles/             # Global CSS and Tailwind config
│       ├── utils/              # Helper functions & constants
│       ├── App.jsx
│       └── main.jsx
│   ├── .env                    # Frontend environment variables
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

Ensure the following are installed and ready:

- Python 3.9+
- Node.js 18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com))
- [Mistral AI](https://console.mistral.ai) API key
- [Tavily](https://tavily.com) API key (free tier available)
- [OpenWeatherMap](https://openweathermap.org/api) API key (free tier available)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Prince671/AI-Agent.git
cd AI-Agent
```

---

### 2. Backend Setup

```bash
cd BackEnd

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `BackEnd/` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_super_secret_jwt_key
MISTRAL_API_KEY=your_mistral_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Start the backend:

```bash
python main.py
# Server runs at http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install
```

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
# App runs at http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`BackEnd/.env`)

| Variable | Description | Required |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET_KEY` | Secret for signing JWT tokens | ✅ |
| `MISTRAL_API_KEY` | Mistral AI API key | ✅ |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | ✅ |
| `TAVILY_API_KEY` | Tavily search API key | ✅ |

### Frontend (`Frontend/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | ✅ |

> ⚠️ **Never commit `.env` files to version control.** Add both to `.gitignore`.

---

## 📡 API Reference

All protected endpoints require the header:
```
Authorization: Bearer <your_jwt_token>
```

### 🔐 Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Create a new user account | ❌ |
| `POST` | `/login` | Login and receive JWT token | ❌ |

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": { "id": "...", "username": "prince" }
}
```

---

### 🤖 Agent

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/agent` | Standard agent response (full) | ✅ |
| `POST` | `/agent-stream` | Streaming agent response (SSE) | ✅ |

**Request Body:**
```json
{
  "query": "What is the current price of TSLA?",
  "chat_id": "optional_existing_chat_id"
}
```

**Streaming Response** (`/agent-stream`) uses Server-Sent Events:
```
data: {"token": "The "}
data: {"token": "current "}
data: {"token": "price..."}
data: [DONE]
```

---

### 💬 Chat History

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/chats` | List all user chats | ✅ |
| `GET` | `/chat/<id>` | Get messages in a specific chat | ✅ |
| `DELETE` | `/chat/<id>` | Delete a specific chat | ✅ |

---

### 🔍 Search

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/search?q=query` | Search across chat history | ✅ |

---

## 📱 Mobile Access (Same Network)

**1. Start the frontend with host flag:**
```bash
npm run dev -- --host
```

**2. Find your local IP:**
```bash
# Windows
ipconfig

# macOS / Linux
ifconfig
```

**3. Update `Frontend/.env`:**
```env
VITE_API_URL=http://<YOUR_LOCAL_IP>:5000
```

**4. Open on your phone:**
```
http://<YOUR_LOCAL_IP>:5173
```

---

## 🌍 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

cd Frontend
vercel
```

Set `VITE_API_URL` in Vercel's environment variables dashboard to point to your live backend URL.

### Backend → Render / Railway

1. Push `BackEnd/` to a GitHub repository
2. Connect to [Render](https://render.com) or [Railway](https://railway.app)
3. Set start command: `python main.py`
4. Add all backend environment variables in the platform dashboard

> After deploying the backend, update `VITE_API_URL` in your Vercel frontend settings to the live backend URL and redeploy.

---

## 🗺️ Roadmap

- [ ] 🌐 Multi-language query & response support
- [ ] 🧠 Long-term memory across sessions
- [ ] 📊 Advanced analytics & usage dashboard
- [ ] 🤖 Autonomous multi-step agent workflows
- [ ] 🖼️ Image generation tool integration
- [ ] 🐳 Docker + Docker Compose support
- [ ] 📁 File upload & document analysis tool
- [ ] 🔔 Real-time price/news push notifications

---

## 🙌 Acknowledgements

Special thanks to my mentor for teaching **Generative AI and Agent systems** — the foundational knowledge that made this real-world project possible.

Built on the shoulders of amazing open-source tools: [LangChain](https://langchain.com), [Mistral AI](https://mistral.ai), [Tavily](https://tavily.com), and the broader AI developer community.

---

## 👨‍💻 Author

**Prince Soni**  
AI & Full Stack Developer — passionate about building intelligent, real-world AI systems.

[![GitHub](https://img.shields.io/badge/GitHub-Prince671-181717?style=flat-square&logo=github)](https://github.com/Prince671)

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">

⭐ **If this project helped you, give it a star!** ⭐

👉 Star the repo &nbsp;·&nbsp; Share it &nbsp;·&nbsp; Build something amazing 🚀

Made with ❤️ by Prince Soni

</div>
