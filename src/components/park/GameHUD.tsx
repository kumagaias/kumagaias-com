import { useState } from "react";
import { useLang } from "../../contexts/LanguageContext";

interface Props {
  money: number;
  currentVisitors: number;
  totalVisitors: number;
  capacity: number;
  maintenanceCost: number;
  shopRate: number;
}

export default function GameHUD({ money, currentVisitors, totalVisitors, capacity, maintenanceCost, shopRate }: Props) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);

  const netPerTick = Math.round(currentVisitors * (1 + shopRate) - maintenanceCost);
  const netColor = netPerTick >= 0 ? "#7dffb3" : "#ff7d7d";

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        position: "absolute",
        bottom: "16px",
        right: "16px",
        background: "rgba(0,0,0,0.72)",
        borderRadius: "12px",
        padding: "10px 16px",
        color: "#fff",
        zIndex: 10,
        textAlign: "right",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.12)",
        minWidth: "140px",
        cursor: "pointer",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      {/* Always visible: money + net + visitors */}
      <div style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.02em" }}>
        ${money.toLocaleString()}
      </div>
      <div style={{ fontSize: "0.72rem", color: netColor, fontWeight: 700 }}>
        {netPerTick >= 0 ? "+" : ""}${netPerTick} / tick
      </div>
      <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>
        👥 {currentVisitors.toLocaleString()}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.12)",
          marginTop: "4px",
          paddingTop: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          <div style={{ fontSize: "0.72rem", opacity: 0.65 }}>
            {lang === "jp" ? "定員" : "capacity"} {currentVisitors} / {capacity}
          </div>
          <div style={{ fontSize: "0.72rem", opacity: 0.65 }}>
            {lang === "jp" ? "累計" : "total"} 📊 {totalVisitors.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.72rem", opacity: 0.65 }}>
            {lang === "jp" ? "維持費" : "maint"} ${maintenanceCost}
          </div>
          {shopRate > 0 && (
            <div style={{ fontSize: "0.72rem", opacity: 0.65 }}>
              {lang === "jp" ? "ショップ収益率" : "shop rate"} ×{(1 + shopRate).toFixed(1)}
            </div>
          )}
          <div style={{ fontSize: "0.62rem", opacity: 0.35, marginTop: "2px" }}>
            {lang === "jp" ? "タップで閉じる" : "tap to close"}
          </div>
        </div>
      )}

      {!expanded && (
        <div style={{ fontSize: "0.6rem", opacity: 0.3, marginTop: "1px" }}>
          {lang === "jp" ? "詳細▾" : "detail▾"}
        </div>
      )}
    </div>
  );
}
