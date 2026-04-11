import { Suspense, lazy } from "react";
import WorksSection from "./components/WorksSection";

const AmusementPark = lazy(() => import("./components/AmusementPark"));

function getTimeOfDay(): "day" | "night" {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
}

const isDay = getTimeOfDay() === "day";

const theme = {
  bg: isDay
    ? "linear-gradient(180deg, #87ceeb 0%, #e0f4ff 60%, #90ee90 100%)"
    : "linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 60%, #2d4a1e 100%)",
  text: isDay ? "#1a1a2e" : "#f0f0ff",
  subtitle: isDay ? "#3a5a8a" : "#aaaadd",
};

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Hero: Amusement Park */}
      <div style={{ position: "relative", height: "60vh", minHeight: "400px" }}>
        <Suspense fallback={<div style={{ height: "100%", background: "transparent" }} />}>
          <AmusementPark />
        </Suspense>
        {/* Overlay title */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2rem, 6vw, 4rem)",
              fontWeight: 900,
              margin: 0,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              color: "#fff",
              letterSpacing: "0.05em",
            }}
          >
            kumagaias.com
          </h1>
          <p
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
              margin: "8px 0 0",
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 6px rgba(0,0,0,0.4)",
            }}
          >
            {isDay ? "☀️ Welcome to my portfolio!" : "🌙 Welcome to my portfolio!"}
          </p>
        </div>
      </div>

      {/* Works */}
      <WorksSection />
    </div>
  );
}
