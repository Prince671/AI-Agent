import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "./api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/responsive.css";

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 4,
}));

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");

  const login = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      nav("/chat");
    } catch (e) {
      setError(e?.response?.data?.error || "Login failed. Try again.");
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") login();
  };

  return (
    <div
      className="auth-page"
      style={{
        height: "100vh",
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050a14",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        overflow: "hidden",
        position: "relative",
        padding: "16px",
      }}
    >
      {/* ── Animated particles ── */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.7)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Glow orbs */}
      <div
        style={{
          position: "absolute",
          top: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -150,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#0d1526",
          border: "1px solid #1a2540",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.07)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <motion.div
            className="auth-logo"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              margin: "0 auto 14px",
              boxShadow: "0 0 28px rgba(59,130,246,0.4)",
            }}
          >
            ✦
          </motion.div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#e2e8f0",
              letterSpacing: "-0.04em",
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            Sign in to ps-Agent
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 10,
                padding: "9px 13px",
                fontSize: 13,
                color: "#f87171",
                marginBottom: 16,
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 600,
              display: "block",
              marginBottom: 6,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Email
          </label>
          <motion.div
            animate={{
              boxShadow:
                focused === "email" ? "0 0 0 2px rgba(59,130,246,0.4)" : "none",
            }}
            style={{
              background: "#070d1a",
              border: `1px solid ${focused === "email" ? "#3b82f6" : "#1a2540"}`,
              borderRadius: 11,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              transition: "border-color 0.2s",
            }}
          >
            <span style={{ color: "#64748b", fontSize: 15 }}>✉</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused("")}
              onKeyDown={handleKey}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "#e2e8f0",
                fontSize: 16,
                fontFamily: "inherit",
              }}
            />
          </motion.div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 22 }}>
          <label
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 600,
              display: "block",
              marginBottom: 6,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Password
          </label>
          <motion.div
            animate={{
              boxShadow:
                focused === "pass" ? "0 0 0 2px rgba(59,130,246,0.4)" : "none",
            }}
            style={{
              background: "#070d1a",
              border: `1px solid ${focused === "pass" ? "#3b82f6" : "#1a2540"}`,
              borderRadius: 11,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              transition: "border-color 0.2s",
            }}
          >
            <span style={{ color: "#64748b", fontSize: 15 }}>🔒</span>
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused("")}
              onKeyDown={handleKey}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "#e2e8f0",
                fontSize: 16,
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => setShowPass((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              {showPass ? "🙈" : "👁"}
            </button>
          </motion.div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{
            scale: 1.02,
            boxShadow: "0 6px 24px rgba(59,130,246,0.45)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={login}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 12,
            border: "none",
            background: loading
              ? "#1a2540"
              : "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: loading ? "#64748b" : "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            letterSpacing: "-0.01em",
          }}
        >
          {loading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              >
                ⟳
              </motion.span>{" "}
              Signing in...
            </>
          ) : (
            "Sign In →"
          )}
        </motion.button>

        <p
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#3b82f6",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
