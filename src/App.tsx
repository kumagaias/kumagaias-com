import { Suspense, lazy } from "react";
import WorksSection from "./components/WorksSection";
import { LanguageProvider, useLang } from "./contexts/LanguageContext";

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
};

function LangToggle() {
  const { lang, toggleLang } = useLang();
  const pill: React.CSSProperties = {
    padding: "5px 13px",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    letterSpacing: "0.05em",
    transition: "background 0.18s, color 0.18s",
  };
  return (
    <div
      style={{
        position: "fixed",
        top: "14px",
        right: "14px",
        zIndex: 100,
        display: "flex",
        gap: "2px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        borderRadius: "999px",
        border: "1px solid rgba(255,255,255,0.22)",
        padding: "3px",
      }}
    >
      {(["jp", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => lang !== l && toggleLang()}
          style={{
            ...pill,
            background: lang === l ? "rgba(255,255,255,0.92)" : "transparent",
            color: lang === l ? "#111" : "rgba(255,255,255,0.55)",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function AppContent() {
  const { lang } = useLang();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <LangToggle />

      {/* Hero: Amusement Park game */}
      <div style={{ position: "relative", height: "70vh", minHeight: "480px", overflow: "hidden" }}>
        <Suspense fallback={<div style={{ height: "100%", background: "transparent" }} />}>
          <AmusementPark />
        </Suspense>
      </div>

      {/* Identity banner */}
      <div style={{ textAlign: "center", padding: "28px 24px 0" }}>
        <p style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, letterSpacing: "0.03em", opacity: 0.8 }}>
          kumagaias.com &nbsp;·&nbsp; {lang === "jp" ? "ポートフォリオへようこそ！" : "Welcome to my portfolio!"}
        </p>
      </div>

      {/* Works */}
      <WorksSection />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
