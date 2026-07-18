import { useEffect, useState } from "react";
import WorksSection from "./components/WorksSection";
import { LanguageProvider, useLang } from "./contexts/LanguageContext";
import CompanyPage from "./pages/CompanyPage";
import ContactPage from "./pages/ContactPage";
import PlayPage from "./pages/PlayPage";
import PrivacyPage from "./pages/PrivacyPage";
import "./App.css";

const theme = {
  bg: "#f7f3ea",
  text: "#1f2d2e",
};

const corporateSections = [
  {
    labelJp: "Parenting",
    labelEn: "Parenting",
    titleJp: "育児の判断を少し軽くする",
    titleEn: "Make parenting decisions lighter",
    bodyJp: "学校や地域から届く情報を、家庭で使いやすい形に整え、子育て世代の日々の判断を支えるサービスをつくります。",
    bodyEn: "We shape school and local information into practical services that support everyday decisions for families raising children.",
  },
  {
    labelJp: "Remote Work",
    labelEn: "Remote Work",
    titleJp: "暮らしに合う働き方を支える",
    titleEn: "Support location-flexible work",
    bodyJp: "家庭や地域での生活を大切にしながら働けるよう、リモートワークを前提にした情報共有や業務効率化の仕組みづくりに取り組みます。",
    bodyEn: "We build systems for information sharing and operations that support remote work and everyday life beyond a single office location.",
  },
  {
    labelJp: "Playful Tools",
    labelEn: "Play",
    titleJp: "遊び心から使いやすさを探る",
    titleEn: "Prototype new experiences through play",
    bodyJp: "ゲームやインタラクションの試作を通じて、楽しく続けられる UI や体験のあり方を検証しています。",
    bodyEn: "Through games and interaction prototypes, we explore interfaces and experiences that are useful, approachable, and enjoyable to keep using.",
  },
  {
    labelJp: "Cloud Operations",
    labelEn: "Cloud",
    titleJp: "小さく始めて、安全に育てる",
    titleEn: "Start small and grow safely",
    bodyJp: "AWS を中心に、必要な分だけ使える構成でサービスを運用し、コスト、セキュリティ、継続的な改善を意識して開発しています。",
    bodyEn: "Using AWS-centered architecture, we operate services with attention to cost, security, and continuous improvement.",
  },
];

const companyFacts = [
  { labelJp: "事業名", labelEn: "Name", value: "kumagaias" },
  { labelJp: "設立", labelEn: "Established", valueJp: "2025年9月", valueEn: "September 2025" },
  { labelJp: "所在地", labelEn: "Location", valueJp: "東京都", valueEn: "Tokyo, Japan" },
];

function ShellSection({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section
      id={id}
      style={{
        maxWidth: "1020px",
        margin: "0 auto",
        padding: "56px 24px",
      }}
    >
      {children}
    </section>
  );
}

function navState(route: string, target: string) {
  if (target === "about") return route === "" || route === "#top" || route === "#about";
  if (target === "company") return route === "#/company";
  if (target === "play") return route === "#/play";
  if (target === "privacy") return route === "#/privacy";
  if (target === "contact") return route === "#/contact";
  return false;
}

function navClass(route: string, target: string) {
  return navState(route, target) ? "site-nav-link is-active" : "site-nav-link";
}

function SiteHeader({ route }: { route: string }) {
  const { lang, toggleLang } = useLang();
  return (
    <header
      className="site-header"
      style={{
        position: "fixed",
        top: "14px",
        left: "14px",
        right: "14px",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "10px 14px",
        borderRadius: "14px",
        background: "rgba(8,14,18,0.62)",
        border: "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(10px)",
        color: "#fff",
        boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
      }}
    >
      <a
        href="/"
        style={{
          color: "inherit",
          textDecoration: "none",
          fontWeight: 800,
          letterSpacing: "0.04em",
        }}
      >
        kumagaias
      </a>
      <nav className="site-nav" style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.84rem", fontWeight: 700 }}>
        <a href="#about" className={navClass(route, "about")}>
          {lang === "jp" ? "事業" : "About"}
        </a>
        <a href="#/company" className={navClass(route, "company")}>
          {lang === "jp" ? "会社概要" : "Company"}
        </a>
        <a href="#/play" className={navClass(route, "play")}>
          Play
        </a>
        <a href="#/privacy" className={navClass(route, "privacy")}>
          Privacy
        </a>
        <a href="#/contact" className={navClass(route, "contact")}>
          Contact
        </a>
        <div className="site-lang-switch" aria-label="Language">
          {(["jp", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => lang !== l && toggleLang()}
              className={lang === l ? "site-lang-button is-active" : "site-lang-button"}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}

function CorporateIntro() {
  const { lang } = useLang();
  return (
    <>
      <ShellSection id="about">
        <div
          className="corporate-overview"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.35fr) minmax(260px, 0.65fr)",
            gap: "28px",
            alignItems: "start",
          }}
        >
          <div>
            <p style={{ margin: "0 0 12px", fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.66 }}>
              {lang === "jp" ? "Product Studio" : "Product Studio"}
            </p>
            <h1 style={{ margin: 0, fontSize: "clamp(2.3rem, 7vw, 5rem)", lineHeight: 1.02, fontWeight: 900 }}>
              kumagaias
            </h1>
            <p style={{ margin: "18px 0 0", maxWidth: "680px", fontSize: "clamp(1.02rem, 2.4vw, 1.35rem)", lineHeight: 1.65, fontWeight: 700, opacity: 0.82 }}>
              {lang === "jp"
              ? "kumagaias は、兄弟で運営するプロダクトスタジオです。育児、リモートワーク、遊び心のある体験を軸に、Web とモバイルの実用的なソフトウェアを企画・開発しています。"
              : "kumagaias is a sibling-run product studio focused on parenting, remote work, and playful digital experiences through practical web and mobile software."}
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gap: "10px",
              padding: "18px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(8px)",
            }}
          >
            {companyFacts.map((fact) => (
              <div key={fact.labelEn} style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: "10px", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, opacity: 0.58 }}>
                  {lang === "jp" ? fact.labelJp : fact.labelEn}
                </span>
                <span style={{ fontSize: "0.92rem", fontWeight: 700 }}>
                  {lang === "jp" ? fact.valueJp ?? fact.value : fact.valueEn ?? fact.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ShellSection>

      <ShellSection>
        <div className="focus-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }}>
          {corporateSections.map((item) => (
            <article
              key={item.labelEn}
              style={{
                minHeight: "210px",
                padding: "22px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p style={{ margin: "0 0 18px", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.6 }}>
                {lang === "jp" ? item.labelJp : item.labelEn}
              </p>
              <h2 style={{ margin: "0 0 12px", fontSize: "1.15rem", lineHeight: 1.35 }}>
                {lang === "jp" ? item.titleJp : item.titleEn}
              </h2>
              <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.65, opacity: 0.78, fontWeight: 600 }}>
                {lang === "jp" ? item.bodyJp : item.bodyEn}
              </p>
            </article>
          ))}
        </div>
      </ShellSection>
    </>
  );
}

function AppContent() {
  const { lang } = useLang();
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (route === "#/privacy") {
    return (
      <>
        <SiteHeader route={route} />
        <PrivacyPage />
      </>
    );
  }

  if (route === "#/company") {
    return (
      <>
        <SiteHeader route={route} />
        <CompanyPage />
      </>
    );
  }

  if (route === "#/play") {
    return (
      <>
        <SiteHeader route={route} />
        <PlayPage />
      </>
    );
  }

  if (route === "#/contact") {
    return (
      <>
        <SiteHeader route={route} />
        <ContactPage />
      </>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <SiteHeader route={route} />

      <div
        id="top"
        className="corporate-hero"
        style={{
          position: "relative",
          minHeight: "min(760px, 92vh)",
          overflow: "hidden",
          background: "#f3ead8",
        }}
      >
        <picture>
          <source media="(max-width: 720px)" srcSet="/images/kumagaias-hero-mobile.jpg" />
          <img
            src="/images/kumagaias-hero-desktop.jpg"
            alt={lang === "jp" ? "親子が木製の街を組み立てている水彩イラスト" : "Watercolor illustration of a parent and child building a wooden town"}
            className="corporate-hero-image"
          />
        </picture>
        <div
          className="corporate-hero-copy"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "660px",
            padding: "180px 24px 96px",
            margin: "0 auto 0 8vw",
          }}
        >
          <p style={{ margin: "0 0 18px", fontSize: "0.82rem", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "#476c5c" }}>
            Product Studio / Established 2025
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(2.7rem, 7vw, 5.8rem)", lineHeight: 0.98, color: "#1e2a2d", fontWeight: 900 }}>
            kumagaias
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: "clamp(1.4rem, 3.4vw, 2.35rem)", lineHeight: 1.25, color: "#263536", fontWeight: 850 }}>
            {lang === "jp" ? "育つ毎日に、ちょうどいい道具を。" : "Thoughtful tools for growing days."}
          </p>
          <p style={{ margin: "24px 0 0", maxWidth: "560px", fontSize: "clamp(1.03rem, 2.1vw, 1.28rem)", lineHeight: 1.75, color: "#2f3939", fontWeight: 700 }}>
            {lang === "jp"
              ? "育児、リモートワーク、遊び心を軸に、暮らしと仕事に寄り添う Web とモバイルの道具をつくっています。"
              : "We build web and mobile tools for parenting, remote work, and playful everyday experiences."}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "30px" }}>
            <a className="hero-link primary" href="#works">{lang === "jp" ? "プロダクトを見る" : "View Products"}</a>
            <a className="hero-link" href="#/contact">Contact</a>
          </div>
        </div>
      </div>

      {/* Identity banner */}
      <div style={{ textAlign: "center", padding: "28px 24px 0" }}>
        <p style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, letterSpacing: "0.03em", opacity: 0.8 }}>
          kumagaias.com &nbsp;·&nbsp; {lang === "jp" ? "Web とモバイルのプロダクトスタジオ" : "Web and mobile product studio"}
        </p>
      </div>

      <CorporateIntro />

      {/* Works */}
      <WorksSection />

      <footer
        style={{
          padding: "8px 24px 28px",
          textAlign: "center",
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
          opacity: 0.55,
        }}
      >
        Copyright &copy; 2026 kumagaias. All rights reserved. &nbsp;|&nbsp; <a href="#/privacy" style={{ color: "inherit" }}>Privacy Policy</a>
        &nbsp;|&nbsp; <a href="#/contact" style={{ color: "inherit" }}>Contact</a>
      </footer>
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
