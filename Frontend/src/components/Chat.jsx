import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "./api";
import { listen } from "../utils/voice";
import StockChart from "./StockChart";
import ReactMarkdown from "react-markdown";
import "../styles/responsive.css";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// THEMES
// ─────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#050a14",
    sidebar: "#070d1a",
    border: "#1a2540",
    accent: "#3b82f6",
    accentSoft: "rgba(59,130,246,0.12)",
    text: "#e2e8f0",
    muted: "#64748b",
    userBubble: "#1d4ed8",
    aiBubble: "#0f172a",
    inputBg: "#0d1526",
    skeletonBase: "#0d1526",
    skeletonShimmer: "#1a2540",
  },
  light: {
    bg: "#f0f4ff",
    sidebar: "#ffffff",
    border: "#dde5f5",
    accent: "#3b82f6",
    accentSoft: "rgba(59,130,246,0.10)",
    text: "#0f172a",
    muted: "#64748b",
    userBubble: "#2563eb",
    aiBubble: "#e8eeff",
    inputBg: "#f1f5ff",
    skeletonBase: "#e2e8f0",
    skeletonShimmer: "#c8d5f0",
  },
};

// ─────────────────────────────────────────────
// SKELETON HELPERS
// ─────────────────────────────────────────────
function Bone({ w = "100%", h = 16, r = 8, theme }) {
  const t = THEMES[theme];
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        flexShrink: 0,
        background: `linear-gradient(90deg,${t.skeletonBase} 25%,${t.skeletonShimmer} 50%,${t.skeletonBase} 75%)`,
        backgroundSize: "200% 100%",
        animation: "skshimmer 1.5s infinite",
      }}
    />
  );
}

function ChatSkeleton({ theme }) {
  const t = THEMES[theme];
  const rows = [
    { user: false, widths: ["320px", "260px", "200px"] },
    { user: true, widths: ["240px", "160px"] },
    { user: false, widths: ["280px", "350px", "220px", "180px"] },
    { user: true, widths: ["200px"] },
  ];
  return (
    <div
      style={{
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {rows.map((row, ri) => (
        <div
          key={ri}
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            justifyContent: row.user ? "flex-end" : "flex-start",
          }}
        >
          {!row.user && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: t.skeletonShimmer,
                flexShrink: 0,
                animation: "skshimmer 1.5s infinite",
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: row.user ? "flex-end" : "flex-start",
            }}
          >
            {row.widths.map((w, i) => (
              <Bone key={i} w={w} h={14} theme={theme} />
            ))}
          </div>
          {row.user && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: t.skeletonShimmer,
                flexShrink: 0,
                animation: "skshimmer 1.5s infinite",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SidebarSkeleton({ theme }) {
  const t = THEMES[theme];
  return (
    <div
      style={{
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: t.skeletonShimmer,
            animation: "skshimmer 1.5s infinite",
          }}
        />
        <Bone w="100px" h={16} theme={theme} />
      </div>
      <Bone w="100%" h={38} r={10} theme={theme} />
      <Bone w="100%" h={36} r={9} theme={theme} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 8,
        }}
      >
        {[80, 70, 65, 75, 60].map((pct, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: t.skeletonBase,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <Bone w={`${pct}%`} h={13} theme={theme} />
            <Bone w="60px" h={11} theme={theme} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TYPING DOTS
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// STREAMING CURSOR
// ─────────────────────────────────────────────
function TypewriterText({ text, theme, isStreaming }) {
  const t = THEMES[theme];
  return (
    <div
      className="markdown-body"
      style={{ color: t.text, position: "relative" }}
    >
      <ReactMarkdown>{text || ""}</ReactMarkdown>
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: t.accent,
            marginLeft: 2,
            verticalAlign: "text-bottom",
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// VOICE LISTENING OVERLAY
// ─────────────────────────────────────────────
function ListeningOverlay({ theme }) {
  const t = THEMES[theme];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(5,10,20,0.88)",
        backdropFilter: "blur(14px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 120,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.45,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: `2px solid ${t.accent}`,
            }}
          />
        ))}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `linear-gradient(135deg,${t.accent},#8b5cf6)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            boxShadow: `0 0 40px ${t.accent}88`,
            zIndex: 1,
          }}
        >
          🎤
        </motion.div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginTop: 24,
          alignItems: "center",
          height: 40,
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: [8, 8 + Math.random() * 28, 8] }}
            transition={{
              duration: 0.45 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.09,
            }}
            style={{
              width: 4,
              borderRadius: 2,
              background: `linear-gradient(to top,${t.accent},#8b5cf6)`,
            }}
          />
        ))}
      </div>
      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={{
          color: t.text,
          fontSize: 15,
          fontWeight: 600,
          marginTop: 16,
          letterSpacing: "0.02em",
        }}
      >
        Listening...
      </motion.p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SPEAKER ICON BUTTON
// ─────────────────────────────────────────────
function SpeakerIcon({ text, theme }) {
  const [speaking, setSpeaking] = useState(false);
  const t = THEMES[theme];

  const toggle = () => {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    const plain = text.replace(/[#*`_~>\[\]]/g, "");
    const utt = new SpeechSynthesisUtterance(plain);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis?.speak(utt);
    setSpeaking(true);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.18, color: t.accent }}
      whileTap={{ scale: 0.88 }}
      onClick={toggle}
      title={speaking ? "Stop reading" : "Read aloud"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: speaking ? t.accent : t.muted,
        fontSize: 16,
        lineHeight: 1,
        padding: "3px 5px",
        display: "inline-flex",
        alignItems: "center",
        marginTop: 5,
        borderRadius: 6,
        transition: "color 0.2s",
      }}
    >
      {speaking ? (
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.55, repeat: Infinity }}
        >
          🔊
        </motion.span>
      ) : (
        <span style={{ opacity: 0.65 }}>🔈</span>
      )}
    </motion.button>
  );
}

// ─────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────
function MessageBubble({ msg, theme, isLastAI, isStreaming }) {
  const t = THEMES[theme];
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.08, type: "spring" }}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg,${t.accent},#8b5cf6)`,
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
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          maxWidth: "72%",
        }}
      >
        <div
          style={{
            padding: msg.chart ? "0" : "12px 16px",
            borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
            background: isUser
              ? `linear-gradient(135deg,${t.userBubble},#4f46e5)`
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
                : "0 2px 12px rgba(0,0,0,0.12)",
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
          ) : isUser ? (
            <div className="markdown-body" style={{ color: "#fff" }}>
              <ReactMarkdown>{msg.text || ""}</ReactMarkdown>
            </div>
          ) : (
            <TypewriterText
              text={msg.text || ""}
              theme={theme}
              isStreaming={isLastAI && isStreaming}
            />
          )}
        </div>

        {/* Speaker icon — AI only */}
        {!isUser && !msg.typing && !msg.chart && msg.text && (
          <SpeakerIcon text={msg.text} theme={theme} />
        )}
      </div>

      {isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
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

// ─────────────────────────────────────────────
// SIDEBAR CHAT ITEM
// ─────────────────────────────────────────────
function ChatItem({ chat, active, onClick, onDelete, theme }) {
  const t = THEMES[theme];
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        cursor: "pointer",
        marginBottom: 4,
        background: active
          ? t.accentSoft
          : hov
            ? `${t.accentSoft}88`
            : "transparent",
        border: `1px solid ${active ? t.accent + "44" : "transparent"}`,
        transition: "all 0.2s",
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
        {(hov || active) && (
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

// ─────────────────────────────────────────────
// MAIN CHAT
// ─────────────────────────────────────────────
export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 640);
  const [theme, setTheme] = useState("dark");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const [pageLoading, setPageLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  const bottomRef = useRef();
  const inputRef = useRef();
  const abortRef = useRef(null);
  const t = THEMES[theme];
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    (async () => {
      setPageLoading(true);
      await fetchChats();
      setPageLoading(false);
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const r = await api.get("/chats");
      setChats(r.data.reverse());
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

  const searchChats = async (v) => {
    setSearch(v);
    if (!v) return fetchChats();
    const r = await api.get(`/search?q=${v}`);
    setChats(r.data.reverse());
  };

  const loadChat = async (id) => {
    try {
      setChatLoading(true);
      const r = await api.get(`/chat/${id}`);
      setMessages(r.data.messages || []);
      setChatId(id);
      if (isMobile) setSidebarOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setChatId(null);
    setInput("");
    if (isMobile) setSidebarOpen(false);
  };

  const handleVoice = async () => {
    if (loading) return;
    setListening(true);
    try {
      const txt = await listen();
      setInput(txt);
    } catch (e) {
      console.error(e);
    }
    setListening(false);
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setLoading(false);
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.typing)
        return prev
          .slice(0, -1)
          .concat({ role: "ai", text: "⏹ Response stopped." });
      return prev;
    });
  };

  const sendMessage = async (msgInput = input) => {
    if (!msgInput.trim() || loading) return;
    const userMsg = msgInput.trim();
    setInput("");
    setLoading(true);
    setIsStreaming(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg },
      { role: "ai", typing: true },
    ]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agent-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg, chat_id: chatId }),
        signal: ctrl.signal,
      });

      if (!res.ok) throw new Error("Server error");
      const ct = res.headers.get("content-type") || "";

      if (ct.includes("application/json")) {
        const data = await res.json();
        if (data.type === "stock_chart")
          setMessages((prev) =>
            prev.slice(0, -1).concat({ role: "ai", chart: data.symbol }),
          );
        else if (data.error)
          setMessages((prev) =>
            prev.slice(0, -1).concat({ role: "ai", text: `⚠️ ${data.error}` }),
          );
        fetchChats();
        return;
      }

      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";

      setMessages((prev) => prev.slice(0, -1).concat({ role: "ai", text: "" }));
      setIsStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        setMessages((prev) => {
          const u = [...prev];
          u[u.length - 1] = { role: "ai", text: full };
          return u;
        });
      }
      fetchChats();
    } catch (err) {
      if (err.name === "AbortError") return;
      setMessages((prev) =>
        prev
          .slice(0, -1)
          .concat({
            role: "ai",
            text: "⚠️ Something went wrong. Please try again.",
          }),
      );
    } finally {
      setIsStreaming(false);
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const lastAIIdx = messages
    .map((m, i) => (m.role === "ai" ? i : -1))
    .filter((i) => i !== -1)
    .pop();

  // ── GLOBAL STYLES injected once ──
  const globalCSS = `
    @keyframes skshimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{width:100%;height:100%;overflow:hidden;}
    #root{width:100%;height:100%;overflow:hidden;}
    .msgs-scroll{overflow-y:auto;overflow-x:hidden;}
    .msgs-scroll::-webkit-scrollbar{width:4px;}
    .msgs-scroll::-webkit-scrollbar-track{background:transparent;}
    .msgs-scroll::-webkit-scrollbar-thumb{background:${t.border};border-radius:4px;}
    .sb-scroll{overflow-y:auto;overflow-x:hidden;}
    .sb-scroll::-webkit-scrollbar{width:3px;}
    .sb-scroll::-webkit-scrollbar-track{background:transparent;}
    .sb-scroll::-webkit-scrollbar-thumb{background:${t.border};border-radius:4px;}
    .markdown-body p{margin:0 0 6px 0;}
    .markdown-body p:last-child{margin-bottom:0;}
    .markdown-body ul,.markdown-body ol{padding-left:18px;margin:4px 0;}
    .markdown-body code{background:rgba(99,102,241,0.15);padding:2px 5px;border-radius:4px;font-size:13px;}
    .markdown-body pre{background:rgba(0,0,0,0.28);padding:10px;border-radius:8px;overflow-x:auto;margin:8px 0;}
  `;

  // ── PAGE-LEVEL SKELETON ──
  if (pageLoading) {
    return (
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: t.bg,
          fontFamily: "'Sora','DM Sans',sans-serif",
        }}
      >
        <style>{globalCSS}</style>
        {/* Sidebar skeleton */}
        <div
          style={{
            width: 260,
            flexShrink: 0,
            borderRight: `1px solid ${t.border}`,
            background: t.sidebar,
            overflow: "hidden",
          }}
        >
          <SidebarSkeleton theme={theme} />
        </div>
        {/* Main skeleton */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header skeleton */}
          <div
            style={{
              height: 57,
              flexShrink: 0,
              borderBottom: `1px solid ${t.border}`,
              background: t.sidebar,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Bone w="36px" h={36} r={8} theme={theme} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Bone w="120px" h={15} theme={theme} />
                <Bone w="80px" h={11} theme={theme} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Bone w="80px" h={32} r={20} theme={theme} />
              <Bone w="80px" h={32} r={20} theme={theme} />
              <Bone w="70px" h={32} r={20} theme={theme} />
            </div>
          </div>
          {/* Messages skeleton */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ChatSkeleton theme={theme} />
          </div>
          {/* Input skeleton */}
          <div
            style={{
              height: 76,
              flexShrink: 0,
              borderTop: `1px solid ${t.border}`,
              background: t.sidebar,
              padding: "14px 20px",
            }}
          >
            <Bone w="100%" h={48} r={16} theme={theme} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden" /* NO page scroll ever */,
        background: t.bg,
        color: t.text,
        fontFamily: "'Sora','DM Sans',sans-serif",
        position: "relative",
      }}
    >
      <style>{globalCSS}</style>

      {/* Listening overlay */}
      <AnimatePresence>
        {listening && <ListeningOverlay theme={theme} />}
      </AnimatePresence>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
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

      {/* ══ SIDEBAR ══════════════════════════════ */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{
              x: isMobile ? -270 : 0,
              width: isMobile ? 260 : 0,
              opacity: isMobile ? 1 : 0,
            }}
            animate={{ x: 0, width: 260, opacity: 1 }}
            exit={{
              x: isMobile ? -270 : 0,
              width: isMobile ? 260 : 0,
              opacity: isMobile ? 1 : 0,
            }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: t.sidebar,
              borderRight: `1px solid ${t.border}`,
              height: "100vh" /* full height, no overflow */,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              zIndex: 20,
              flexShrink: 0,
              ...(isMobile
                ? {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    boxShadow: "4px 0 40px rgba(0,0,0,0.5)",
                  }
                : {}),
            }}
          >
            {/* Top section — fixed, does not scroll */}
            <div style={{ padding: "18px 16px 8px", flexShrink: 0 }}>
              {/* Logo + close */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
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
                      background: `linear-gradient(135deg,${t.accent},#8b5cf6)`,
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

              {/* New Chat */}
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
                  marginBottom: 12,
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
                  gap: 7,
                  marginBottom: 8,
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

              <p
                style={{
                  fontSize: 10,
                  color: t.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Recent
              </p>
            </div>

            {/* Scrollable chat list */}
            <div
              className="sb-scroll"
              style={{ flex: 1, padding: "0 16px 16px" }}
            >
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
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══ MAIN COLUMN ══════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
          overflow: "hidden" /* children handle their own scroll */,
        }}
      >
        {/* ── STICKY HEADER ── */}
        <header
          style={{
            flexShrink: 0 /* will NOT shrink */,
            height: 57,
            padding: "0 20px",
            borderBottom: `1px solid ${t.border}`,
            background: `${t.sidebar}f0`,
            backdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            zIndex: 10,
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
              <p style={{ fontSize: 11, color: t.muted, whiteSpace: "nowrap" }}>
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
            {/* Theme */}
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
              {!isMobile && <span>{theme === "dark" ? "Dark" : "Light"}</span>}
            </motion.button>

            {/* Voice */}
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
              disabled={loading}
              style={{
                background: listening
                  ? `linear-gradient(135deg,${t.accent},#8b5cf6)`
                  : t.accentSoft,
                border: `1px solid ${listening ? "transparent" : t.border}`,
                borderRadius: 20,
                padding: isMobile ? "6px 10px" : "6px 14px",
                cursor: loading ? "not-allowed" : "pointer",
                color: listening ? "#fff" : t.text,
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {listening ? "🔴" : "🎤"}
              {!isMobile && <span>{listening ? "Listening..." : "Voice"}</span>}
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
              ⏻{!isMobile && <span> Logout</span>}
            </motion.button>
          </div>
        </header>

        {/* ── MESSAGES (only thing that scrolls) ── */}
        <div
          className="msgs-scroll"
          style={{
            flex: 1 /* fills all remaining vertical space */,
            padding: isMobile ? "16px 12px" : "24px 20px",
          }}
        >
          {chatLoading ? (
            <ChatSkeleton theme={theme} />
          ) : messages.length === 0 ? (
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
                ].map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{
                      scale: 1.04,
                      background: t.accent,
                      color: "#fff",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(s)}
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
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  theme={theme}
                  isLastAI={i === lastAIIdx}
                  isStreaming={isStreaming}
                />
              ))}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── STICKY INPUT BAR ── */}
        <footer
          style={{
            flexShrink: 0 /* will NOT shrink */,
            padding: isMobile ? "10px 12px 14px" : "12px 20px 16px",
            borderTop: `1px solid ${t.border}`,
            background: `${t.sidebar}f0`,
            backdropFilter: "blur(16px)",
            zIndex: 10,
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
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKey}
              disabled={loading}
              placeholder={
                listening
                  ? "Listening…"
                  : isMobile
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
                fontSize: isMobile ? 16 : 14,
                resize: "none",
                fontFamily: "inherit",
                lineHeight: 1.6,
                padding: "4px 0",
                maxHeight: 120,
                overflowY: "auto",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "text",
              }}
            />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
              {/* Mic */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={handleVoice}
                disabled={loading}
                style={{
                  background: listening
                    ? `linear-gradient(135deg,${t.accent},#8b5cf6)`
                    : t.accentSoft,
                  border: "none",
                  borderRadius: 10,
                  padding: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  color: listening ? "#fff" : t.muted,
                  fontSize: 16,
                  lineHeight: 1,
                  opacity: loading ? 0.5 : 1,
                }}
              >
                🎤
              </motion.button>

              {/* Stop OR Send */}
              {loading || isStreaming ? (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={stopStreaming}
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#dc2626)",
                    border: "none",
                    borderRadius: 10,
                    padding: isMobile ? "8px 12px" : "8px 18px",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    boxShadow: "0 4px 14px rgba(239,68,68,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    ⏹
                  </motion.span>
                  {!isMobile && "Stop"}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  style={{
                    background: !input.trim()
                      ? t.border
                      : `linear-gradient(135deg,${t.accent},#6366f1)`,
                    border: "none",
                    borderRadius: 10,
                    padding: isMobile ? "8px 12px" : "8px 18px",
                    cursor: !input.trim() ? "not-allowed" : "pointer",
                    color: !input.trim() ? t.muted : "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    boxShadow: input.trim()
                      ? `0 4px 14px ${t.accent}55`
                      : "none",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isMobile ? "↑" : "Send ↑"}
                </motion.button>
              )}
            </div>
          </div>

          <p
            style={{
              fontSize: 11,
              color: t.muted,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            {loading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🤖 Responding… click ⏹ to stop
              </motion.span>
            ) : (
              <>
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
              </>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
