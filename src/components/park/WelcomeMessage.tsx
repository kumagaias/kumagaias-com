import { useEffect, useState } from "react";
import { useLang } from "../../contexts/LanguageContext";

export default function WelcomeMessage() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");
  const { lang } = useLang();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fading"), 3000);
    const t2 = setTimeout(() => setPhase("gone"), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none",
        zIndex: 20,
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 1.2s ease",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
          fontWeight: 900,
          color: "#fff",
          textShadow: "0 2px 16px rgba(0,0,0,0.65)",
          margin: 0,
          letterSpacing: "0.05em",
        }}
      >
        kumagaias.com
      </h1>
      <p
        style={{
          color: "rgba(255,255,255,0.88)",
          textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          margin: "8px 0 0",
          fontSize: "clamp(0.85rem, 1.8vw, 1.15rem)",
        }}
      >
        {lang === "jp" ? "ポートフォリオへようこそ！" : "Welcome to my portfolio!"}
      </p>
    </div>
  );
}
