import { useLang } from "../../contexts/LanguageContext";

export default function SiteFooter() {
  const { lang } = useLang();

  return (
    <footer
      style={{
        padding: "24px",
        textAlign: "center",
        fontSize: "0.78rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: "rgba(31,45,46,0.58)",
        background: "#f7f3ea",
      }}
    >
      Copyright &copy; 2026 kumagaias. All rights reserved. &nbsp;|&nbsp;{" "}
      <a href="#/privacy" style={{ color: "inherit" }}>
        {lang === "jp" ? "プライバシーポリシー" : "Privacy Policy"}
      </a>
      &nbsp;|&nbsp;{" "}
      <a href="#/contact" style={{ color: "inherit" }}>
        {lang === "jp" ? "お問い合わせ" : "Contact"}
      </a>
    </footer>
  );
}
