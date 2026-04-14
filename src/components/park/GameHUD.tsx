import { useState } from "react";
import { useLang } from "../../contexts/LanguageContext";
import type { WeatherType } from "./ParkScene";
import type { AudienceType } from "./types";

const WEATHER_ICON: Record<WeatherType, string> = { sunny: "☀️", cloudy: "⛅", rainy: "🌧️" };
const WEATHER_LABEL_JP: Record<WeatherType, string> = { sunny: "晴れ", cloudy: "くもり", rainy: "雨" };
const WEATHER_LABEL_EN: Record<WeatherType, string> = { sunny: "Sunny", cloudy: "Cloudy", rainy: "Rainy" };

const AUDIENCE_EMOJI: Record<AudienceType, string> = { family: "👨‍👩‍👧", couple: "💑", solo: "🧍" };
const AUDIENCE_LABEL_JP: Record<AudienceType, string> = { family: "子連れ", couple: "カップル", solo: "ひとり" };

interface Props {
  money: number;
  currentVisitors: number;
  totalVisitors: number;
  capacity: number;
  maintenanceCost: number;
  grossPerTick: number;
  weather: WeatherType;
  visitorGroups: Record<AudienceType, number>;
  diversityBonus: number;
  buzz: number;
  onSave: () => void;
  onRestart: () => void;
}

export default function GameHUD({ money, currentVisitors, totalVisitors, capacity, maintenanceCost, grossPerTick, weather, visitorGroups, diversityBonus, buzz, onSave, onRestart }: Props) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    onSave();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const netPerTick = grossPerTick - maintenanceCost;
  const netColor     = netPerTick >= 0 ? "#7dffb3" : "#ff7d7d";

  // Buzz: map [0.5, 1.0] → [0, 5] stars
  const starsFilled = Math.round((buzz - 0.5) / 0.5 * 5);
  const starsDisplay = "★".repeat(starsFilled) + "☆".repeat(5 - starsFilled);
  const buzzColor = buzz >= 0.9 ? "#ffd700" : buzz >= 0.7 ? "#ffaa44" : buzz >= 0.55 ? "#ff8844" : "#ff5555";
  const sub: React.CSSProperties = {
    fontSize: "0.64rem", opacity: 0.5, textAlign: "right", lineHeight: 1.6,
  };
  const weatherLabel = lang === "jp" ? WEATHER_LABEL_JP[weather] : WEATHER_LABEL_EN[weather];

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
        gap: "2px",
      }}
    >
      {/* Line 1: Weather icon + label */}
      <div style={{ fontSize: "0.78rem", opacity: 0.85, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
        <span>{WEATHER_ICON[weather]}</span>
        <span>{weatherLabel}</span>
      </div>

      {/* Line 2: Money */}
      <div style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.02em", marginTop: "1px" }}>
        ${money.toLocaleString()}
      </div>

      {/* Line 3: Net P&L */}
      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: netColor }}>
        {netPerTick >= 0 ? "+" : ""}${netPerTick}
      </div>
      {expanded && (
        <div style={{ ...sub, display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <span style={{ color: "#7dffb3" }}>+{grossPerTick} {lang === "jp" ? "収益" : "revenue"}</span>
          <span style={{ color: "#ff7d7d" }}>-{maintenanceCost} {lang === "jp" ? "維持" : "maint"}</span>
        </div>
      )}

      {/* Line 4: Current / capacity guests */}
      <div style={{ fontSize: "0.82rem", marginTop: "2px" }}>
        👥 {currentVisitors.toLocaleString()} / {capacity}{lang === "jp" ? "人" : ""}
      </div>
      {expanded && (
        <div style={sub}>
          👥 {totalVisitors.toLocaleString()} {lang === "jp" ? "累計" : "total"}
        </div>
      )}

      {/* Buzz / hype stars — always visible */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px", marginTop: "3px" }}>
        <span style={{ fontSize: "0.62rem", opacity: 0.55 }}>{lang === "jp" ? "話題性" : "Buzz"}</span>
        <span style={{ fontSize: "0.82rem", color: buzzColor, letterSpacing: "-1px" }}>{starsDisplay}</span>
      </div>
      {expanded && (
        <div style={{ ...sub, color: buzzColor }}>
          {Math.round(buzz * 100)}%
          {buzz <= 0.5
            ? (lang === "jp" ? " ・ 新アトラクションで回復" : " · Add new ride to recover")
            : buzz < 1.0
            ? (lang === "jp" ? " ・ 徐々に飽きられています" : " · Hype fading…")
            : (lang === "jp" ? " ・ 最高潮！" : " · Full hype!")}
        </div>
      )}

      {/* Visitor group breakdown + diversity bonus */}
      {expanded && (
        <div style={{ marginTop: "6px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "6px" }}>
          <div style={{ fontSize: "0.62rem", opacity: 0.5, textAlign: "right", marginBottom: "3px" }}>
            {lang === "jp" ? "来場者層" : "Audience"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" }}>
            {(["family", "couple", "solo"] as AudienceType[]).map(t => (
              <div key={t} style={{ fontSize: "0.64rem", opacity: visitorGroups[t] > 0 ? 0.85 : 0.28 }}>
                {AUDIENCE_EMOJI[t]} {lang === "jp" ? AUDIENCE_LABEL_JP[t] : t} {visitorGroups[t]}
              </div>
            ))}
          </div>
          <div style={{
            fontSize: "0.64rem",
            marginTop: "4px",
            textAlign: "right",
            color: diversityBonus > 1 ? "#7dffb3" : diversityBonus < 1 ? "#ff9977" : "rgba(255,255,255,0.5)",
          }}>
            {diversityBonus > 1
              ? (lang === "jp" ? `✨ 多様性ボーナス +${Math.round((diversityBonus - 1) * 100)}%` : `✨ Diversity +${Math.round((diversityBonus - 1) * 100)}%`)
              : diversityBonus < 1
              ? (lang === "jp" ? "⚠ 偏り −10%" : "⚠ Skewed −10%")
              : (lang === "jp" ? "来場者層バランス良好" : "Balanced")}
          </div>
        </div>
      )}

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "6px" }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleSave}
            style={{
              width: "100%", padding: "6px 0", borderRadius: "7px", fontSize: "0.72rem", fontWeight: 700,
              border: "1px solid rgba(125,255,179,0.4)", background: "rgba(125,255,179,0.14)",
              color: "#7dffb3", cursor: "pointer",
            }}
          >
            {savedMsg
              ? (lang === "jp" ? "✅ セーブしました！" : "✅ Saved!")
              : (lang === "jp" ? "💾 セーブ" : "💾 Save")}
          </button>
          <button
            onClick={onRestart}
            style={{
              width: "100%", padding: "6px 0", borderRadius: "7px", fontSize: "0.72rem", fontWeight: 700,
              border: "1px solid rgba(255,125,125,0.4)", background: "rgba(255,80,30,0.14)",
              color: "#ff9977", cursor: "pointer",
            }}
          >
            {lang === "jp" ? "🔄 やり直す" : "🔄 Restart"}
          </button>
        </div>
      )}

      {/* Toggle hint */}
      <div style={{ fontSize: "0.58rem", opacity: 0.28, marginTop: "8px" }}>
        {expanded
          ? (lang === "jp" ? "閉じる" : "close")
          : (lang === "jp" ? "詳細▾" : "detail▾")}
      </div>
    </div>
  );
}
