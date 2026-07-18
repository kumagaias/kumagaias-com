import { useState } from "react";
import type { Work } from "../../data/works";
import { useLang } from "../../contexts/LanguageContext";
import Label from "./Label";
import { TYPE_META } from "./workConstants";

export default function WorkCard({ work, onDetail }: { work: Work; onDetail: () => void }) {
  const [hovered, setHovered] = useState(false);
  const { lang } = useLang();
  const title = lang === "en" && work.titleEn ? work.titleEn : work.title;
  const description = lang === "en" && work.descriptionEn ? work.descriptionEn : work.description;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="work-card"
      style={{
        display: "flex",
        height: "180px",
        background: "rgba(255,255,255,0.72)",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid rgba(31,45,46,0.12)",
        boxShadow: hovered ? "0 14px 32px rgba(31,45,46,0.16)" : "0 4px 18px rgba(31,45,46,0.08)",
        transform: hovered ? "translateY(-3px)" : "none",
        transition: "transform 0.22s, box-shadow 0.22s",
      }}
    >
      <div onClick={onDetail} style={{ flexShrink: 0, width: "200px", cursor: "pointer" }}>
        <img src={work.screenshot} alt={title} style={{ width: "200px", height: "180px", objectFit: "cover", objectPosition: "top", display: "block" }} />
      </div>
      <div onClick={onDetail} style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px", minWidth: 0, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
          {work.url ? (
            <a href={work.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, textDecoration: "none", color: "inherit" }}>
              {title}
            </a>
          ) : (
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>{title}</h3>
          )}
          <Label text={work.price} color={work.price === "無料" ? "#2f6f59" : "#836328"} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {work.types.map((t) => {
              const m = TYPE_META[t];
              const href = t === "web" || t === "CLI" ? work.url : t === "iOS" ? work.iosUrl : work.androidUrl;
              const inner = <><m.Icon size={15} />{m.label}</>;
              return href ? (
                <a key={t} href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{
                  color: m.color, display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none",
                }}>
                  {inner}
                </a>
              ) : (
                <span key={t} style={{ color: m.color, display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 700, opacity: 0.45 }}>
                  {inner}
                </span>
              );
            })}
          </div>
          <span style={{ fontSize: "0.75rem", opacity: 0.55 }}>{work.releaseDate}</span>
        </div>

        <p style={{
          margin: 0, fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.5,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {description}
        </p>
        <div style={{ marginTop: "auto" }}>
          <button onClick={(e) => { e.stopPropagation(); onDetail(); }} style={{
            padding: "6px 16px", borderRadius: "999px", border: "1px solid rgba(31,45,46,0.18)",
            background: "rgba(31,45,46,0.05)", color: "inherit", fontSize: "0.8rem", cursor: "pointer", fontWeight: 700,
          }}>
            {lang === "jp" ? "詳細" : "Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
