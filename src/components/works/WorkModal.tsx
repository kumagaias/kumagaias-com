import { useEffect, useState } from "react";
import type { Work } from "../../data/works";
import { useLang } from "../../contexts/LanguageContext";
import Label from "./Label";
import { AndroidIcon, GlobeIcon, IOSIcon } from "./icons";
import { TECH_COLORS, TYPE_META } from "./workConstants";

export default function WorkModal({ work, onClose }: { work: Work; onClose: () => void }) {
  const { lang } = useLang();
  const gallery = work.screenshots ?? [work.screenshot];
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const title = lang === "en" && work.titleEn ? work.titleEn : work.title;
  const description = lang === "en" && work.descriptionEn ? work.descriptionEn : work.description;
  const period = lang === "en" && work.periodEn ? work.periodEn : work.period;
  const motivation = lang === "en" && work.motivationEn ? work.motivationEn : work.motivation;
  const painPoint = lang === "en" && work.painPointEn ? work.painPointEn : work.painPoint;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "rgba(20,20,35,0.97)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px",
        maxWidth: "540px", width: "100%", maxHeight: "80vh", overflowY: "auto",
        padding: "28px", color: "#f0f0ff", position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.1)",
          border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%",
          cursor: "pointer", fontSize: "1.1rem",
        }}>
          x
        </button>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ cursor: "zoom-in" }} onClick={() => setLightbox(true)}>
            <img src={gallery[activeImg]} alt={title} style={{ width: "100%", borderRadius: "10px", objectFit: "contain", maxHeight: "400px", display: "block" }} />
          </div>
          {gallery.length > 1 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              {gallery.map((src, i) => (
                <img key={src} src={src} alt={`${title} ${i + 1}`} onClick={() => setActiveImg(i)} style={{
                  width: "72px", height: "48px", objectFit: "cover", borderRadius: "6px", cursor: "pointer",
                  opacity: i === activeImg ? 1 : 0.5, border: i === activeImg ? "2px solid #1f8fff" : "2px solid transparent",
                }} />
              ))}
            </div>
          )}
        </div>

        {lightbox && (
          <div onClick={() => setLightbox(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)", zIndex: 1100,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out",
          }}>
            <img src={gallery[activeImg]} alt={title} style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain", borderRadius: "8px" }} />
          </div>
        )}

        <h2 style={{ margin: "0 0 4px", fontSize: "1.25rem" }}>{title}</h2>
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          {work.types.map((t) => {
            const m = TYPE_META[t];
            return <span key={t} style={{ color: m.color, display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem" }}><m.Icon size={14} /> {m.label}</span>;
          })}
          <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>|</span>
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>{work.releaseDate}</span>
        </div>
        {work.award && (
          <div style={{
            margin: "-6px 0 18px", padding: "8px 10px", borderRadius: "8px",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#f1d28a", fontSize: "0.78rem", lineHeight: 1.45, fontWeight: 700,
          }}>
            {work.award}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: "0.9rem", opacity: 0.85, lineHeight: 1.6 }}>{description}</div>
          <InfoBlock title="Tech Stack">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{work.techStack.map((t) => <Label key={t} text={t} color={TECH_COLORS[t] ?? "#888"} />)}</div>
          </InfoBlock>
          <InfoBlock title={lang === "jp" ? "開発期間" : "Dev Period"}>{period}</InfoBlock>
          <InfoBlock title={lang === "jp" ? "動機" : "Motivation"}>{motivation}</InfoBlock>
          <InfoBlock title={lang === "jp" ? "苦労した点" : "Challenges"}>{painPoint}</InfoBlock>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
          {work.url && <ModalLink href={work.url} color="#6bbeff" Icon={GlobeIcon}>{lang === "jp" ? "サイトを見る" : "Visit Site"}</ModalLink>}
          {work.iosUrl && <ModalLink href={work.iosUrl} color="#d8d8d8" Icon={IOSIcon}>App Store</ModalLink>}
          {work.androidUrl && <ModalLink href={work.androidUrl} color="#74d6aa" Icon={AndroidIcon}>Google Play</ModalLink>}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, opacity: 0.5, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>{title}</div>
      <div style={{ fontSize: "0.88rem", lineHeight: 1.6, opacity: 0.85 }}>{children}</div>
    </div>
  );
}

function ModalLink({ href, color, Icon, children }: { href: string; color: string; Icon: (p: { size?: number }) => React.ReactElement; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px",
      borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
      color, fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
    }}>
      <Icon size={14} /> {children}
    </a>
  );
}
