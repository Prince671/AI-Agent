# 🚀 AI Agent

An advanced **Full Stack AI Agent** that can understand user queries, use tools intelligently, and respond in real-time with **voice, streaming, and dynamic UI**.

This is not just a chatbot — it’s a **tool-using intelligent assistant**.

---

# ✨ Features

## 🤖 AI Agent (Core)
- Tool-based AI using **LangChain + Mistral**
- Automatically selects tools based on query
- Supports:
  - 🌦️ Weather
  - 📰 News
  - 🏙️ City Info
  - 📍 Places
  - 📈 Stock Price
  - 💱 Currency Conversion

---

## ⚡ Real-Time Streaming
- ChatGPT-like **streaming responses**
- Smooth character-by-character output
- Faster and interactive UX

---

## 🎤 Voice Assistant
- 🎙️ Voice input (speech-to-text)
- 🔊 AI voice response (text-to-speech)
- Hands-free interaction

---

## 📊 Stock Chart Visualization
- Real-time **interactive stock charts**
- Built with **Chart.js + React**
- Dynamically rendered inside chat

---

## 💬 Chat System
- Chat history stored in **MongoDB**
- Sidebar chat navigation
- Auto chat title generation
- Search inside chats

---

## 🔐 Authentication
- JWT-based login & register
- Protected routes
- Secure API calls

---

## 🎨 Modern UI (Jarvis Style)
- Built with **React + Tailwind CSS**
- Clean dashboard UI
- Skeleton loading
- Smooth animations

---

# 🧱 Tech Stack

## 🔹 Frontend
- React (Vite)
- Tailwind CSS
- Chart.js
- Axios
- Web Speech API

## 🔹 Backend
- Flask
- MongoDB
- JWT Authentication
- Flask-CORS

## 🔹 AI Layer
- LangChain
- Mistral AI
- Tavily API (Search)
- Tool-based Agent

---

# 📂 Project Structure

```
AI-Agent/
│
├── BackEnd/
│   ├── core_agent.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── api.js
│   │   │   ├── Chat.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StockChart.jsx
│   │   │   ├── WeatherWidget.jsx
│   │   │
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │
│   ├── .env
│   ├── index.html
│   ├── package.json
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Prince671/AI-Agent.git
cd AI-Agent
```

---

## 2️⃣ Backend Setup

```bash
cd BackEnd
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

### Create `.env`

```env
MONGO_URI=your_mongodb_url
JWT_SECRET_KEY=your_secret_key
OPENWEATHER_API_KEY=your_key
TAVILY_API_KEY=your_key
```

---

## ▶️ Run Backend

```bash
python main.py
```

---

## 3️⃣ Frontend Setup

```bash
cd Frontend
npm install
```

### Create `.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## ▶️ Run Frontend

```bash
npm run dev
```

---

# 🌐 Run on Mobile (Same Network)

```bash
npm run dev -- --host
```

Then open:

```
http://YOUR_IP:5173
```

---

# 📡 API Endpoints

## 🔐 Auth
- `POST /register`
- `POST /login`

## 🤖 Agent
- `POST /agent`
- `POST /agent-stream`

## 💬 Chat
- `GET /chats`
- `GET /chat/<id>`
- `DELETE /chat/<id>`

## 🔍 Search
- `GET /search?q=query`

---

# ⚡ Key Highlights

- 🚀 Streaming AI responses  
- 🎤 Voice-enabled assistant  
- 📊 Live stock chart inside chat  
- 🧠 Tool-using intelligent agent  
- 💬 Persistent chat memory  
- 🔐 JWT authentication  

---

# 🚀 Deployment

## Frontend
- Vercel

## Backend
- Render / Railway

---

# 🌍 Future Improvements

- 🌐 Multi-language support  
- 🧠 Long-term memory  
- 📊 Advanced analytics dashboard  
- 🤖 Autonomous agent workflows  

---

# 🙌 Acknowledgement

Special thanks to my mentor for teaching me **Generative AI and Agent systems**, which helped me build this real-world project.

---

# 👨‍💻 Author

**Prince Soni**  
🚀 AI & Full Stack Developer  

---

# ⭐ Support

If you like this project:

👉 Star the repository  
👉 Share it with others  
👉 Build something amazing 🚀
