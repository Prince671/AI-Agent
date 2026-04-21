import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function StockChart({ symbol }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: 300,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#0d1526",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: `tv-${symbol}`,
    });

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container stock-chart-container";
    widgetDiv.style.height = "300px";
    widgetDiv.style.width = "100%";

    const innerDiv = document.createElement("div");
    innerDiv.className = "tradingview-widget-container__widget";
    innerDiv.style.height = "100%";
    innerDiv.style.width = "100%";

    widgetDiv.appendChild(innerDiv);
    widgetDiv.appendChild(script);
    containerRef.current.appendChild(widgetDiv);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="stock-chart-wrapper"
      style={{ borderRadius: 14, overflow: "hidden", background: "#0d1526" }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "10px 16px",
          background: "#070d1a",
          borderBottom: "1px solid #1a2540",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
          }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#e2e8f0",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          📈 {symbol}
        </span>
        <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>
          Live Chart
        </span>
      </div>

      {/* TradingView Widget */}
      <div
        ref={containerRef}
        className="stock-chart-container"
        style={{ height: 300, width: "100%" }}
      />
    </motion.div>
  );
}
