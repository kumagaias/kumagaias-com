import { useState } from "react";
import { useLang } from "../../contexts/LanguageContext";
import type { WeatherType } from "./ParkScene";

const WEATHER_ICON: Record<WeatherType, string> = { sunny: "☀️", cloudy: "⛅", rainy: "🌧️" };

interface Props {
  money: number;
  currentVisitors: number;
  totalVisitors: number;
  capacity: number;
  maintenanceCost: number;
  shopRate: number;
  weather: WeatherType;
}

export default function GameHUD({ money, currentVisitors, totalVisitors, capacity, maintenanceCost, shopRate, weather }: Props) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);

  const grossPerTick = Math.round(currentVisitors * (1 + shopRate));
  const netPerTick   = grossPerTick - maintenanceCost;
  const netColor     = netPerTick >= 0 ? "#7dffb3" : "#ff7d7d";
  const sub: React.CSSProperties = {
    fontSize: "0.64rem", opacity: 0.5, textAlign: "right", lineHeight: 1.5,
  };

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        position: "absolute",
        bottom: "16px",
        right: "16px",
        background: "rgba(0,0,0,0.72)",
        borderRadius: "12px",
        padding: "10px 14px",
        color: "#fff",
        zIndex: 10,
        textAlign: "right",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.12)",
        cursor: "pointer",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        gap: "1px",
      }}
    >
      {/* Line 1: Money + weather */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
        <span style={{ fontSize: "0.9rem" }}>{WEATHER_ICON[weather]}</span>
        <span style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.02em" }}>${money.toLocaleString()}</span>
      </div>

      {/* Line 2: Net P&L */}
      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: netColor, marginTop: "3px" }}>
        💰 {netPerTick >= 0 ? "+" : ""}${netPerTick}
      </div>
      {expanded && (
        <div style={{ ...sub, display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <span style={{ color: "#7dffb3" }}>+{grossPerTick} {lang === "jp" ? "収益" : "revenue"}</span>
          <span style={{ color: "#ff7d7d" }}>-{maintenanceCost} {lang === "jp" ? "維持" : "maint"}</span>
        </div>
      )}

      {/* Line 3: Current guests / capacity */}
      <div style={{ fontSize: "0.82rem", marginTop: "3px" }}>
        👥 {currentVisitors.toLocaleString()} / {capacity}{lang === "jp" ? "人" : ""}
      </div>
      {expanded && (
        <div style={sub}>
          👥 {totalVisitors.toLocaleString()} {lang === "jp" ? "累計" : "total"}
        </div>
      )}

      {/* Toggle hint */}
      <div style={{ fontSize: "0.58rem", opacity: 0.28, marginTop: "3px" }}>
        {expanded
          ? (lang === "jp" ? "閉じる" : "close")
          : (lang === "jp" ? "詳細▾" : "detail▾")}
      </div>
    </div>
  );
}
