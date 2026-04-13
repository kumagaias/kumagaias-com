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
        gap: "3px",
      }}
    >
      {/* Money */}
      <div style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.02em" }}>
        ${money.toLocaleString()}
      </div>

      {/* Gross per tick */}
      <div style={{ fontSize: "0.72rem", color: grossPerTick >= 0 ? "#7dffb3" : "#ff7d7d", fontWeight: 700 }}>
        {grossPerTick >= 0 ? "+" : ""}${grossPerTick} / tick
      </div>

      {/* Maintenance */}
      <div style={{ fontSize: "0.72rem", color: "rgba(255,160,100,0.9)" }}>
        -${maintenanceCost} maint
      </div>

      {/* Divider + current visitors */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "4px", marginTop: "1px" }}>
        <span style={{ fontSize: "0.82rem" }}>👥 {currentVisitors.toLocaleString()}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.12)",
          marginTop: "2px",
          paddingTop: "5px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
        }}>
          <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>
            net: {netPerTick >= 0 ? "+" : ""}${netPerTick} / tick
          </div>
          <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>
            {lang === "jp" ? "定員" : "cap"} {currentVisitors}/{capacity}
          </div>
          <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>
            👥 {totalVisitors.toLocaleString()} {lang === "jp" ? "累計" : "total"}
          </div>
          {shopRate > 0 && (
            <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>
              shop ×{(1 + shopRate).toFixed(1)}
            </div>
          )}
          <div style={{ fontSize: "0.6rem", opacity: 0.3, marginTop: "2px" }}>
            {lang === "jp" ? "タップで閉じる" : "tap to close"}
          </div>
        </div>
      )}

      {!expanded && (
        <div style={{ fontSize: "0.6rem", opacity: 0.3 }}>
          {lang === "jp" ? "詳細▾" : "detail▾"}
        </div>
      )}
    </div>
  );
}
