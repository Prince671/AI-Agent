import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const WEATHER_ICONS = {
  clear: "☀️",
  clouds: "☁️",
  rain: "🌧️",
  drizzle: "🌦️",
  thunderstorm: "⛈️",
  snow: "❄️",
  mist: "🌫️",
  fog: "🌫️",
  haze: "🌫️",
};

function getIcon(desc = "") {
  const d = desc.toLowerCase();
  for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
    if (d.includes(key)) return icon;
  }
  return "🌤️";
}

export default function WeatherWidget({ theme = "dark" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const colors = {
    dark: {
      bg: "#0d1526",
      border: "#1a2540",
      text: "#e2e8f0",
      muted: "#64748b",
    },
    light: {
      bg: "#e8eeff",
      border: "#dde5f5",
      text: "#0f172a",
      muted: "#64748b",
    },
  };
  const c = colors[theme] || colors.dark;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const key = import.meta.env.VITE_OPENWEATHER_KEY;
          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`,
          );
          setData(res.data);
        } catch (e) {
          setError("Weather unavailable");
        }
        setLoading(false);
      },
      () => {
        setError("Location access denied");
        setLoading(false);
      },
    );
  }, []);

  if (loading)
    return (
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          padding: "14px 18px",
          borderRadius: 14,
          background: c.bg,
          border: `1px solid ${c.border}`,
          fontSize: 13,
          color: c.muted,
        }}
      >
        🌐 Detecting location...
      </motion.div>
    );

  if (error)
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          color: "#f87171",
          fontSize: 13,
        }}
      >
        ⚠️ {error}
      </div>
    );

  if (!data) return null;

  const icon = getIcon(data.weather[0].description);
  const temp = Math.round(data.main.temp);
  const feels = Math.round(data.main.feels_like);
  const humidity = data.main.humidity;
  const wind = Math.round(data.wind.speed);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="weather-widget"
      style={{
        borderRadius: 16,
        background: "linear-gradient(135deg, #1d3461, #2563eb)",
        padding: "18px 20px",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(37,99,235,0.35)",
        minWidth: 220,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              opacity: 0.75,
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            📍 {data.name}, {data.sys.country}
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <span
              className="weather-temp"
              style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}
            >
              {temp}°
            </span>
            <span style={{ fontSize: 14, opacity: 0.7, marginBottom: 6 }}>
              C
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              opacity: 0.85,
              marginTop: 4,
              textTransform: "capitalize",
            }}
          >
            {data.weather[0].description}
          </p>
        </div>
        <motion.div
          className="weather-icon"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: 46, lineHeight: 1 }}
        >
          {icon}
        </motion.div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {[
          { label: "Feels like", value: `${feels}°C` },
          { label: "Humidity", value: `${humidity}%` },
          { label: "Wind", value: `${wind} m/s` },
        ].map(({ label, value }) => (
          <div key={label} style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontSize: 11, opacity: 0.65, marginBottom: 3 }}>
              {label}
            </p>
            <p style={{ fontSize: 13, fontWeight: 700 }}>{value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
