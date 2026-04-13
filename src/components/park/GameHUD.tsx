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

  const netPerTick = Math.round(currentVisitors * (1 + shopRate) - maintenanceCost);
  const netColor = netPerTick >= 0 ? "#7dffb3" : "#ff7d7d";

  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        right: "16px",
        background: "rgba(0,0,0,0.72)",
        borderRadius: "12px",
        padding: "12px 18px",
        color: "#fff",
        zIndex: 10,
        textAlign: "right",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.12)",
        minWidth: "148px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      {/* Money */}
      <div style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "0.02em" }}>
        ${money.toLocaleString()}
      </div>

      {/* Net income per tick */}
      <div style={{ fontSize: "0.72rem", color: netColor, fontWeight: 600 }}>
        {netPerTick >= 0 ? "+" : ""}${netPerTick} / {lang === "jp" ? "tick" : "tick"}
        <span style={{ opacity: 0.55, fontWeight: 400 }}>
          {" "}({lang === "jp" ? "維持" : "maint"} ${maintenanceCost})
        </span>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {/* Current visitors */}
        <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>
          👥 {currentVisitors.toLocaleString()}
          <span style={{ opacity: 0.5, fontSize: "0.72rem" }}>
            {" "}/ {capacity} {lang === "jp" ? "人 (現在)" : "(now)"}
          </span>
        </div>

        {/* Total visitors */}
        <div style={{ fontSize: "0.78rem", opacity: 0.65 }}>
          📊 {totalVisitors.toLocaleString()} {lang === "jp" ? "人 (累計)" : "(total)"}
        </div>
      </div>
    </div>
  );
}
