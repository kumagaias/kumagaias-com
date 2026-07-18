import { useLang } from "../contexts/LanguageContext";

const facts = [
  { labelJp: "屋号", labelEn: "Trade Name", value: "kumagaias" },
  { labelJp: "設立", labelEn: "Established", valueJp: "2025年9月", valueEn: "September 2025" },
  { labelJp: "所在地", labelEn: "Location", valueJp: "東京都", valueEn: "Tokyo, Japan" },
  { labelJp: "運営体制", labelEn: "Team", valueJp: "兄弟による共同運営", valueEn: "Sibling-run studio" },
  { labelJp: "事業内容", labelEn: "Business", valueJp: "Web / モバイルアプリの企画・開発・運用", valueEn: "Planning, development, and operation of web and mobile apps" },
  { labelJp: "利用基盤", labelEn: "Cloud", valueJp: "AWS を中心としたクラウド基盤", valueEn: "AWS-centered cloud infrastructure" },
];

export default function CompanyPage() {
  const { lang } = useLang();

  return (
    <main style={{ minHeight: "100vh", background: "#f7f3ea", color: "#1f2d2e", padding: "118px 24px 56px" }}>
      <div style={{ maxWidth: "940px", margin: "0 auto" }}>
        <p style={{ margin: "32px 0 10px", fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#476c5c" }}>
          Company
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.1 }}>
          {lang === "jp" ? "事業概要" : "Business Profile"}
        </h1>
        <p style={{ margin: "18px 0 34px", maxWidth: "760px", lineHeight: 1.85, opacity: 0.78, fontWeight: 650 }}>
          {lang === "jp"
            ? "kumagaias は、兄弟で運営するプロダクトスタジオです。育児、リモートワーク、遊び心のある体験を軸に、暮らしと仕事の中で長く使えるソフトウェアを企画・開発しています。AWS を中心に、運用しやすく拡張しやすい構成でサービスを育てています。"
            : "kumagaias is a sibling-run product studio. We plan and develop lasting software around parenting, remote work, and playful digital experiences, using AWS-centered infrastructure that is practical to operate and grow."}
        </p>

        <div style={{ borderTop: "1px solid rgba(31,45,46,0.16)" }}>
          {facts.map((fact) => (
            <div key={fact.labelEn} className="company-row">
              <div style={{ fontWeight: 900, opacity: 0.66 }}>
                {lang === "jp" ? fact.labelJp : fact.labelEn}
              </div>
              <div style={{ fontWeight: 700 }}>
                {lang === "jp" ? fact.valueJp ?? fact.value : fact.valueEn ?? fact.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
