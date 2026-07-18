import { Suspense, lazy } from "react";
import { useLang } from "../contexts/LanguageContext";

const AmusementPark = lazy(() => import("../components/AmusementPark"));

export default function PlayPage() {
  const { lang } = useLang();

  return (
    <main style={{ minHeight: "100vh", background: "#f7f3ea", color: "#1f2d2e", padding: "112px 24px 56px" }}>
      <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
        <p style={{ margin: "32px 0 10px", fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#476c5c" }}>
          Play
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.1 }}>
          {lang === "jp" ? "遊び心の実験室" : "Playful Experiments"}
        </h1>
        <p style={{ margin: "14px 0 26px", maxWidth: "760px", lineHeight: 1.8, opacity: 0.78, fontWeight: 650 }}>
          {lang === "jp"
            ? "Web で動く小さな体験を通じて、楽しく使い続けられる UI の形を探しています。"
            : "Small browser-based demos for exploring interfaces that feel useful, approachable, and fun."}
        </p>
        <div className="playground-frame">
          <Suspense fallback={<div style={{ height: "520px", background: "#e6dcc8" }} />}>
            <AmusementPark />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
