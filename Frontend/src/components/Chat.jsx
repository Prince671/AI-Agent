import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "./api";
import { listen, speak } from "../utils/voice";
import StockChart from "./StockChart";
import ReactMarkdown from "react-markdown";
import "../styles/responsive.css"; // ← import responsive styles
import { Navigate, useNavigate } from "react-router-dom";

// ── Theme Context ──────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#050a14",
    sidebar: "#070d1a",
    surface: "#0d1526",
    border: "#1a2540",
    card: "#111827",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    accentSoft: "rgba(59,130,246,0.12)",
    text: "#e2e8f0",
    muted: "#64748b",
    userBubble: "#1d4ed8",
    aiBubble: "#0f172a",
    inputBg: "#0d1526",
    glow: "0 0 40px rgba(59,130,246,0.15)",
  },
  light: {
    bg: "#f0f4ff",
    sidebar: "#ffffff",
    surface: "#ffffff",
    border: "#dde5f5",
    card: "#f8faff",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    accentSoft: "rgba(59,130,246,0.10)",
    text: "#0f172a",
    muted: "#64748b",
    userBubble: "#2563eb",
    aiBubble: "#e8eeff",
    inputBg: "#f1f5ff",
    glow: "0 0 40px rgba(59,130,246,0.08)",
  },
};

// ── Typing Indicator ───────────────────────────────────────────
function TypingDots({ theme }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 5,
        alignItems: "center",
        padding: "4px 0",
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: THEMES[theme].accent,
          }}
        />
      ))}
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────
function MessageBubble({ msg, i, theme }) {
  const t = THEMES[theme];
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 8,
      }}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="msg-avatar"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            marginRight: 10,
            flexShrink: 0,
            alignSelf: "flex-end",
            boxShadow: `0 0 14px ${t.accent}55`,
          }}
        >
          ✦
        </motion.div>
      )}

      <div
        className="message-bubble"
        style={{
          maxWidth: "72%",
          padding: msg.chart ? "0" : "12px 16px",
          borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
          background: isUser
            ? `linear-gradient(135deg, ${t.userBubble}, #4f46e5)`
            : msg.chart
              ? "transparent"
              : t.aiBubble,
          color: isUser ? "#fff" : t.text,
          fontSize: 14,
          lineHeight: 1.65,
          boxShadow: isUser
            ? `0 4px 20px ${t.accent}44`
            : msg.chart
              ? "none"
              : `0 2px 12px rgba(0,0,0,0.12)`,
          border: !isUser && !msg.chart ? `1px solid ${t.border}` : "none",
          wordBreak: "break-word",
        }}
      >
        {msg.typing ? (
          <TypingDots theme={theme} />
        ) : msg.chart ? (
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: `1px solid ${t.border}`,
            }}
          >
            <StockChart symbol={msg.chart} />
          </div>
        ) : (
          <div
            className="markdown-body"
            style={{ color: isUser ? "#fff" : t.text }}
          >
            <ReactMarkdown>{msg.text || ""}</ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div
          className="msg-avatar"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            marginLeft: 10,
            flexShrink: 0,
            alignSelf: "flex-end",
          }}
        >
          👤
        </div>
      )}
    </motion.div>
  );
}

// ── Sidebar Chat Item ──────────────────────────────────────────
function ChatItem({ chat, active, onClick, onDelete, theme }) {
  const t = THEMES[theme];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        cursor: "pointer",
        background: active
          ? t.accentSoft
          : hovered
            ? `${t.accentSoft}88`
            : "transparent",
        border: `1px solid ${active ? t.accent + "44" : "transparent"}`,
        transition: "all 0.2s",
        marginBottom: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: active ? t.accent : t.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {chat.title || "New Chat"}
        </p>
        <p style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>
          {new Date(chat.created_at).toLocaleDateString()}
        </p>
      </div>

      <AnimatePresence>
        {(hovered || active) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chat.chat_id);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
              fontSize: 13,
              padding: "2px 5px",
              borderRadius: 6,
              marginLeft: 6,
            }}
          >
            ✕
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Chat Component ────────────────────────────────────────
export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 640);
  const [theme, setTheme] = useState("dark");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const bottomRef = useRef();
  const inputRef = useRef();
  const t = THEMES[theme];
  const navigate = useNavigate();

  // ── Responsive: track viewport width ──
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) setSidebarOpen(false); // keep user's choice on desktop
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    fetchChats();
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await api.get("/chats");
      setChats(res.data.reverse());
    } catch (e) {
      console.error(e);
    }
  };

  const deleteChat = async (id) => {
    await api.delete(`/chat/${id}`);
    if (chatId === id) {
      setMessages([]);
      setChatId(null);
    }
    fetchChats();
  };

  const searchChats = async (value) => {
    setSearch(value);
    if (!value) return fetchChats();
    const res = await api.get(`/search?q=${value}`);
    setChats(res.data.reverse());
  };

  const loadChat = async (id) => {
    try {
      const res = await api.get(`/chat/${id}`);
      setMessages(res.data.messages || []);
      setChatId(id);
      if (isMobile) setSidebarOpen(false); // close drawer on mobile after selection
    } catch (e) {
      console.error(e);
    }
  };

  const newChat = () => {
    setMessages([]);
    setChatId(null);
    setInput("");
    if (isMobile) setSidebarOpen(false);
  };

  const handleVoice = async () => {
    setListening(true);
    try {
      const text = await listen();
      setInput(text);
    } catch (e) {
      console.error(e);
    }
    setListening(false);
  };

  const sendMessage = async (msgInput = input) => {
    if (!msgInput.trim() || loading) return;

    const userMsg = msgInput.trim();
    setInput("");
    setLoading(true);

    // ✅ Add user + typing in ONE update (fix race condition)
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg },
      { role: "ai", typing: true },
    ]);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/agent-stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userMsg,
            chat_id: chatId,
          }),
        },
      );

      // ❌ Handle HTTP errors
      if (!response.ok) {
        throw new Error("Server error");
      }

      const contentType = response.headers.get("content-type") || "";

      // =========================
      // 📊 JSON RESPONSE (TOOLS)
      // =========================
      if (contentType.includes("application/json")) {
        const data = await response.json();

        if (data.type === "stock_chart") {
          setMessages((prev) =>
            prev.slice(0, -1).concat({
              role: "ai",
              chart: data.symbol,
            }),
          );
        } else if (data.error) {
          setMessages((prev) =>
            prev.slice(0, -1).concat({
              role: "ai",
              text: `⚠️ ${data.error}`,
            }),
          );
        }

        setLoading(false);
        fetchChats();
        return;
      }

      // =========================
      // 🔄 STREAM RESPONSE
      // =========================
      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";

      // Replace typing with empty message
      setMessages((prev) => prev.slice(0, -1).concat({ role: "ai", text: "" }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "ai",
            text: fullText,
          };
          return updated;
        });
      }

      // 🔊 Speak after complete response
      if (fullText) speak(fullText);

      fetchChats();
    } catch (err) {
      console.error(err);

      setMessages((prev) =>
        prev.slice(0, -1).concat({
          role: "ai",
          text: "⚠️ Something went wrong. Please try again.",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",

        background: t.bg,
        color: t.text,
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Ambient Glow BG ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              theme === "dark"
                ? "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              theme === "dark"
                ? "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 19,
          }}
        />
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            className="chat-sidebar"
            initial={{
              x: isMobile ? -280 : 0,
              width: isMobile ? 260 : 0,
              opacity: isMobile ? 1 : 0,
            }}
            animate={{ x: 0, width: 260, opacity: 1 }}
            exit={{
              x: isMobile ? -280 : 0,
              width: isMobile ? 260 : 0,
              opacity: isMobile ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: t.sidebar,
              borderRight: `1px solid ${t.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 20,
              flexShrink: 0,
              ...(isMobile
                ? {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100%",
                    boxShadow: "4px 0 40px rgba(0,0,0,0.5)",
                  }
                : {}),
            }}
          >
            <div
              style={{
                padding: "18px 16px 10px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 260,
                overflowY: "auto",
              }}
            >
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      boxShadow: `0 0 18px ${t.accent}55`,
                    }}
                  >
                    ✦
                  </motion.div>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    ps-Agent
                  </span>
                </div>

                {/* Close button (mobile) */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: t.muted,
                      fontSize: 18,
                      padding: "4px 6px",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* New Chat Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={newChat}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  border: `1px solid ${t.border}`,
                  background: t.accentSoft,
                  color: t.accent,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 16 }}>+</span> New Chat
              </motion.button>

              {/* Search */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: t.inputBg,
                  border: `1px solid ${t.border}`,
                  borderRadius: 9,
                  padding: "7px 11px",
                  marginBottom: 12,
                  gap: 7,
                }}
              >
                <span style={{ color: t.muted, fontSize: 13 }}>🔍</span>
                <input
                  value={search}
                  onChange={(e) => searchChats(e.target.value)}
                  placeholder="Search chats..."
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: t.text,
                    fontSize: 13,
                    flex: 1,
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Chat List */}
              <div style={{ flex: 1, overflowY: "auto", paddingRight: 2 }}>
                <p
                  style={{
                    fontSize: 10,
                    color: t.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  Recent
                </p>
                <AnimatePresence>
                  {chats.map((chat) => (
                    <ChatItem
                      key={chat.chat_id}
                      chat={chat}
                      active={chatId === chat.chat_id}
                      onClick={() => loadChat(chat.chat_id)}
                      onDelete={deleteChat}
                      theme={theme}
                    />
                  ))}
                </AnimatePresence>
                {chats.length === 0 && (
                  <p
                    style={{
                      color: t.muted,
                      fontSize: 12,
                      textAlign: "center",
                      marginTop: 20,
                    }}
                  >
                    No chats yet
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ MAIN AREA ══════════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
          minWidth: 0,
        }}
      >
        {/* ── Header ── */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="chat-header"
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${t.border}`,
            background: `${t.sidebar}cc`,
            backdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "nowrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 8 : 12,
              minWidth: 0,
            }}
          >
            {/* Sidebar toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen((v) => !v)}
              style={{
                background: t.accentSoft,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                color: t.text,
                cursor: "pointer",
                padding: "6px 9px",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {sidebarOpen && !isMobile ? "◀" : "☰"}
            </motion.button>

            <div style={{ minWidth: 0 }}>
              <h1
                className="chat-header-title"
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                🤖 ps-Agent
              </h1>
              <p
                className="chat-header-subtitle"
                style={{ fontSize: 11, color: t.muted, whiteSpace: "nowrap" }}
              >
                City · Finance · Weather · News
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 6 : 10,
              flexShrink: 0,
            }}
          >
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
              style={{
                background: t.accentSoft,
                border: `1px solid ${t.border}`,
                borderRadius: 20,
                padding: isMobile ? "6px 10px" : "6px 14px",
                cursor: "pointer",
                color: t.text,
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              <motion.span
                animate={{ rotate: theme === "dark" ? 0 : 180 }}
                transition={{ duration: 0.4 }}
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </motion.span>
              {!isMobile && (
                <span className="theme-btn-label">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              )}
            </motion.button>

            {/* Voice button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                listening
                  ? {
                      boxShadow: [
                        `0 0 0 0 ${t.accent}66`,
                        `0 0 0 12px transparent`,
                      ],
                    }
                  : {}
              }
              transition={{ duration: 0.8, repeat: Infinity }}
              onClick={handleVoice}
              style={{
                background: listening
                  ? `linear-gradient(135deg, ${t.accent}, #8b5cf6)`
                  : t.accentSoft,
                border: `1px solid ${listening ? "transparent" : t.border}`,
                borderRadius: 20,
                padding: isMobile ? "6px 10px" : "6px 14px",
                cursor: "pointer",
                color: listening ? "#fff" : t.text,
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              {listening ? "🔴" : "🎤"}
              {!isMobile && (
                <span className="voice-btn-label">
                  {listening ? "Listening..." : "Voice"}
                </span>
              )}
            </motion.button>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("name");
                navigate("/");
              }}
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 20,
                padding: isMobile ? "6px 10px" : "6px 14px",
                cursor: "pointer",
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ⏻ {!isMobile && <span className="logout-label">Logout</span>}
            </motion.button>
          </div>
        </motion.div>

        {/* ── Messages Area ── */}
        <div
          className="messages-area"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "16px 12px" : "24px 20px",
          }}
        >
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                textAlign: "center",
                marginTop: isMobile ? 48 : 80,
                padding: "0 8px",
              }}
            >
              <motion.div
                className="empty-state-icon"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ fontSize: isMobile ? 44 : 56, marginBottom: 16 }}
              >
                ✦
              </motion.div>
              <h2
                className="empty-state-title"
                style={{
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 700,
                  color: t.text,
                  letterSpacing: "-0.03em",
                }}
              >
                What can I help you with?
              </h2>
              <p
                className="empty-state-desc"
                style={{
                  color: t.muted,
                  fontSize: isMobile ? 13 : 14,
                  marginTop: 8,
                }}
              >
                Ask about cities, weather, stocks, currency, news or tourist
                places.
              </p>

              <div
                className="suggestion-grid"
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: 24,
                }}
              >
                {[
                  "🌦️ Weather in Tokyo",
                  "📈 AAPL stock price",
                  "💱 100 USD to EUR",
                  "🏙️ Tell me about Paris",
                  "📰 Latest news in NYC",
                  "🏖️ Places to visit in Bali",
                ].map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    className="suggestion-chip"
                    whileHover={{
                      scale: 1.04,
                      background: t.accent,
                      color: "#fff",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(suggestion)}
                    style={{
                      padding: isMobile ? "7px 12px" : "8px 16px",
                      borderRadius: 20,
                      border: `1px solid ${t.border}`,
                      background: t.accentSoft,
                      color: t.text,
                      fontSize: isMobile ? 12 : 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} i={i} theme={theme} />
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* ── Input Area ── */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="input-area"
          style={{
            padding: isMobile ? "10px 12px 14px" : "14px 20px 20px",
            borderTop: `1px solid ${t.border}`,
            background: `${t.sidebar}cc`,
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              background: t.inputBg,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              padding: "8px 10px",
              transition: "box-shadow 0.2s",
            }}
          >
            <textarea
              ref={inputRef}
              className="chat-textarea"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKey}
              placeholder={
                isMobile
                  ? "Ask anything…"
                  : "Ask about cities, weather, stocks, news..."
              }
              rows={1}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: t.text,
                fontSize: isMobile ? 16 : 14, // 16px prevents iOS zoom
                resize: "none",
                fontFamily: "inherit",
                lineHeight: 1.6,
                padding: "4px 0",
                maxHeight: 120,
                overflowY: "auto",
              }}
            />

            <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
              {/* Voice button in input */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={handleVoice}
                style={{
                  background: listening
                    ? `linear-gradient(135deg, ${t.accent}, #8b5cf6)`
                    : t.accentSoft,
                  border: "none",
                  borderRadius: 10,
                  padding: "8px",
                  cursor: "pointer",
                  color: listening ? "#fff" : t.muted,
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                🎤
              </motion.button>

              {/* Send button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  background:
                    loading || !input.trim()
                      ? t.border
                      : `linear-gradient(135deg, ${t.accent}, #6366f1)`,
                  border: "none",
                  borderRadius: 10,
                  padding: isMobile ? "8px 12px" : "8px 18px",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  color: loading || !input.trim() ? t.muted : "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow:
                    !loading && input.trim()
                      ? `0 4px 14px ${t.accent}55`
                      : "none",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    ⟳
                  </motion.span>
                ) : isMobile ? (
                  "↑"
                ) : (
                  "Send ↑"
                )}
              </motion.button>
            </div>
          </div>

          {/* Keyboard hint — hidden on mobile via CSS */}
          <p
            className="input-hint"
            style={{
              fontSize: 11,
              color: t.muted,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Press{" "}
            <kbd
              style={{
                background: t.border,
                padding: "1px 5px",
                borderRadius: 4,
                fontSize: 10,
              }}
            >
              Enter
            </kbd>{" "}
            to send ·{" "}
            <kbd
              style={{
                background: t.border,
                padding: "1px 5px",
                borderRadius: 4,
                fontSize: 10,
              }}
            >
              Shift+Enter
            </kbd>{" "}
            for new line
          </p>
        </motion.div>
      </div>
    </div>
  );
}
