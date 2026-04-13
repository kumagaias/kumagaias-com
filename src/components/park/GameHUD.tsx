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

  const grossPerTick = Math.round(currentVisitors * (1 + shopRate));
  const netPerTick   = grossPerTick - maintenanceCost;
  const netColor     = netPerTick >= 0 ? "#7dffb3" : "#ff7d7d";
  const sub: React.CSSProperties = { fontSize: "0.66rem", opacity: 0.55, textAlign: "right" };

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
      {/* Line 1: Money */}
      <div style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.02em" }}>
        ${money.toLocaleString()}
      </div>

      {/* Line 2: Net per tick */}
      <div style={{ fontSize: "0.75rem", color: netColor, fontWeight: 700 }}>
        {netPerTick >= 0 ? "+" : ""}${netPerTick} / tick
      </div>
      {expanded && (
        <>
          <div style={sub}>+${grossPerTick} {lang === "jp" ? "収益" : "gross"}</div>
          <div style={sub}>-${maintenanceCost} maint</div>
        </>
      )}

      {/* Line 3: Current guests */}
      <div style={{ fontSize: "0.82rem", marginTop: "2px" }}>
        👥 {currentVisitors.toLocaleString()}
      </div>
      {expanded && (
        <div style={sub}>
          👥 {totalVisitors.toLocaleString()} {lang === "jp" ? "累計" : "total"}
        </div>
      )}

      {/* Toggle hint */}
      <div style={{ fontSize: "0.6rem", opacity: 0.3, marginTop: "1px" }}>
        {expanded
          ? (lang === "jp" ? "閉じる" : "close")
          : (lang === "jp" ? "詳細▾" : "detail▾")}
      </div>
    </div>
  );
}
