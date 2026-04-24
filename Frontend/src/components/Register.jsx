import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "./api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/responsive.css";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 4,
}));

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────
function Bone({ w = "100%", h = 16, r = 8 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background:
          "linear-gradient(90deg,#0d1526 25%,#1a2540 50%,#0d1526 75%)",
        backgroundSize: "200% 100%",
        animation: "skshimmer 1.5s infinite",
      }}
    />
  );
}

function RegisterSkeleton() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050a14",
        padding: "16px",
      }}
    >
      <style>{`
        @keyframes skshimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;height:100%;overflow:hidden;}
      `}</style>
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#0d1526",
          border: "1px solid #1a2540",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background:
                "linear-gradient(90deg,#0d1526 25%,#1a2540 50%,#0d1526 75%)",
              backgroundSize: "200% 100%",
              animation: "skshimmer 1.5s infinite",
            }}
          />
          <Bone w="160px" h={22} r={6} />
          <Bone w="110px" h={13} r={4} />
        </div>

        {/* Three input fields */}
        {[["70px"], ["50px"], ["65px"]].map(([lw], i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <Bone w={lw} h={12} r={4} />
            <div style={{ marginTop: 6 }}>
              <Bone w="100%" h={44} r={11} />
            </div>
          </div>
        ))}

        {/* Button */}
        <div style={{ marginTop: 6 }}>
          <Bone w="100%" h={48} r={12} />
        </div>

        {/* Link */}
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 18 }}
        >
          <Bone w="200px" h={13} r={4} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 850);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/register", { name, email, password });
      setSuccess(true);
      setTimeout(() => nav("/"), 1800);
    } catch (e) {
      setError(e?.response?.data?.error || "Registration failed. Try again.");
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  const inputField = (
    label,
    icon,
    value,
    setter,
    type = "text",
    fieldName = "",
  ) => (
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
        {label}
      </label>
      <motion.div
        animate={{
          boxShadow:
            focused === fieldName ? "0 0 0 2px rgba(59,130,246,0.4)" : "none",
        }}
        style={{
          background: "#070d1a",
          border: `1px solid ${focused === fieldName ? "#3b82f6" : "#1a2540"}`,
          borderRadius: 11,
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          gap: 9,
          transition: "border-color 0.2s",
        }}
      >
        <span style={{ color: "#64748b", fontSize: 15 }}>{icon}</span>
        <input
          type={label === "Password" ? (showPass ? "text" : "password") : type}
          placeholder={
            label === "Password"
              ? "Min. 6 characters"
              : label === "Full Name"
                ? "John Doe"
                : "you@example.com"
          }
          value={value}
          onChange={(e) => setter(e.target.value)}
          onFocus={() => setFocused(fieldName)}
          onBlur={() => setFocused("")}
          onKeyDown={handleKey}
          disabled={loading || success}
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
        {label === "Password" && (
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
        )}
      </motion.div>
    </div>
  );

  if (!pageReady) return <RegisterSkeleton />;

  return (
    <div
      className="auth-page"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden" /* no page scroll */,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050a14",
        fontFamily: "'Sora','DM Sans',sans-serif",
        position: "relative",
        padding: "16px",
      }}
    >
      <style>{`
        @keyframes skshimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;height:100%;overflow:hidden;}
      `}</style>

      {/* ── Loading blocker ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(5,10,20,0.65)",
              backdropFilter: "blur(6px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              pointerEvents: "all",
              cursor: "wait",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid rgba(139,92,246,0.2)",
                borderTop: "3px solid #8b5cf6",
              }}
            />
            <p
              style={{
                color: "#94a3b8",
                fontSize: 14,
                fontFamily: "'Sora',sans-serif",
                fontWeight: 500,
              }}
            >
              Creating your account…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success overlay ── */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(5,10,20,0.75)",
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              pointerEvents: "all",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220 }}
              style={{ fontSize: 64 }}
            >
              ✅
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                color: "#4ade80",
                fontSize: 18,
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
              }}
            >
              Account Created!
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ color: "#64748b", fontSize: 13 }}
            >
              Redirecting to login…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particles */}
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
            background: "rgba(139,92,246,0.7)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Glow orbs */}
      <div
        style={{
          position: "absolute",
          top: -150,
          right: -150,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#0d1526",
          border: "1px solid #1a2540",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          position: "relative",
          zIndex: 10,
          pointerEvents: loading || success ? "none" : "auto",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              margin: "0 auto 14px",
              boxShadow: "0 0 28px rgba(139,92,246,0.4)",
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
            Create Account
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            Join ps-Agent today
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

        {inputField("Full Name", "👤", name, setName, "text", "name")}
        {inputField("Email", "✉", email, setEmail, "email", "email")}
        {inputField(
          "Password",
          "🔒",
          password,
          setPassword,
          "password",
          "pass",
        )}

        <motion.button
          whileHover={{
            scale: loading || success ? 1 : 1.02,
            boxShadow:
              loading || success ? "none" : "0 6px 24px rgba(139,92,246,0.45)",
          }}
          whileTap={{ scale: loading || success ? 1 : 0.97 }}
          onClick={handleRegister}
          disabled={loading || success}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 12,
            border: "none",
            background:
              loading || success
                ? "#1a2540"
                : "linear-gradient(135deg,#8b5cf6,#3b82f6)",
            color: loading || success ? "#64748b" : "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: loading || success ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            letterSpacing: "-0.01em",
            marginTop: 6,
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
              Creating account…
            </>
          ) : (
            "Create Account →"
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
          Already have an account?{" "}
          <Link
            to="/"
            style={{
              color: "#8b5cf6",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
