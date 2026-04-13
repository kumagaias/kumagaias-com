import React, { useEffect, useState } from "react";
import { works } from "../data/works";
import type { Work } from "../data/works";
import { useLang } from "../contexts/LanguageContext";

// ── Platform icons ──────────────────────────────────────────────────────────

function GlobeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <ellipse cx="8" cy="8" rx="3" ry="6.5" />
      <line x1="1.5" y1="8" x2="14.5" y2="8" />
      <line x1="2.3" y1="5" x2="13.7" y2="5" />
      <line x1="2.3" y1="11" x2="13.7" y2="11" />
    </svg>
  );
}

function IOSIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="3.5" y="0.8" width="9" height="14.4" rx="2.2" />
      <line x1="6.2" y1="3" x2="9.8" y2="3" strokeWidth="1" />
      <circle cx="8" cy="12.8" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AndroidIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5 C3.5 5.8 5.5 4 8 4 C10.5 4 12.5 5.8 12.5 8.5 L12.5 11.5 C12.5 12.1 12 12.5 11.5 12.5 L4.5 12.5 C4 12.5 3.5 12.1 3.5 11.5 Z" />
      <line x1="5.8" y1="4.3" x2="4.3" y2="2" />
      <line x1="10.2" y1="4.3" x2="11.7" y2="2" />
      <circle cx="5.8" cy="8.2" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="10.2" cy="8.2" r="0.75" fill="currentColor" stroke="none" />
      <line x1="5.8" y1="12.5" x2="5.8" y2="15" />
      <line x1="10.2" y1="12.5" x2="10.2" y2="15" />
    </svg>
  );
}

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
        0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
        -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
        .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
        -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
        .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
        .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
        0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const TYPE_META: Record<string, { label: string; color: string; Icon: (p: { size?: number }) => React.ReactElement }> = {
  web:     { label: "Web",     color: "#1f8fff", Icon: GlobeIcon },
  iOS:     { label: "iOS",     color: "#aaaaaa", Icon: IOSIcon },
  Android: { label: "Android", color: "#4fbf8d", Icon: AndroidIcon },
};

// ── Tech label ───────────────────────────────────────────────────────────────

const TECH_COLORS: Record<string, string> = {
  "React Native": "#ff6d1f",
  "AWS":          "#ffb84d",
  "Claude Code":  "#c8a800",
  "Kiro":         "#4fbf8d",
};

function Label({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "0.72rem",
      fontWeight: 600,
      background: color + "22",
      color,
      border: `1px solid ${color}55`,
      letterSpacing: "0.03em",
    }}>
      {text}
    </span>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────

function WorkModal({ work, onClose }: { work: Work; onClose: () => void }) {
  const { lang } = useLang();
  const gallery = work.screenshots ?? [work.screenshot];
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => { setActiveImg(0); setLightbox(false); }, [work]);

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

  const title = (lang === "en" && work.titleEn) ? work.titleEn : work.title;
  const description = (lang === "en" && work.descriptionEn) ? work.descriptionEn : work.description;
  const period = (lang === "en" && work.periodEn) ? work.periodEn : work.period;
  const motivation = (lang === "en" && work.motivationEn) ? work.motivationEn : work.motivation;
  const painPoint = (lang === "en" && work.painPointEn) ? work.painPointEn : work.painPoint;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(20,20,35,0.97)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "20px",
          maxWidth: "540px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "28px",
          color: "#f0f0ff",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Gallery */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ cursor: "zoom-in" }} onClick={() => setLightbox(true)}>
            <img
              src={gallery[activeImg]}
              alt={title}
              style={{ width: "100%", borderRadius: "10px", objectFit: "contain", maxHeight: "400px", display: "block" }}
            />
          </div>
          {gallery.length > 1 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              {gallery.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${title} ${i + 1}`}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: "72px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    cursor: "pointer",
                    opacity: i === activeImg ? 1 : 0.5,
                    border: i === activeImg ? "2px solid #1f8fff" : "2px solid transparent",
                    transition: "opacity 0.15s, border-color 0.15s",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            onClick={() => setLightbox(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.94)",
              zIndex: 1100,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "zoom-out",
            }}
          >
            <img
              src={gallery[activeImg]}
              alt={title}
              style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain", borderRadius: "8px" }}
            />
          </div>
        )}

        {/* Title */}
        <h2 style={{ margin: "0 0 4px", fontSize: "1.25rem" }}>{title}</h2>
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          {work.types.map((t) => {
            const m = TYPE_META[t];
            return (
              <span key={t} style={{ color: m.color, display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem" }}>
                <m.Icon size={14} /> {m.label}
              </span>
            );
          })}
          <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>|</span>
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>📅 {work.releaseDate}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Description */}
          <div style={{ fontSize: "0.9rem", opacity: 0.85, lineHeight: 1.6 }}>{description}</div>

          {/* Tech stack */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, opacity: 0.5, letterSpacing: "0.08em", marginBottom: "8px", textTransform: "uppercase" }}>
              Tech Stack
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {work.techStack.map((t) => (
                <Label key={t} text={t} color={TECH_COLORS[t] ?? "#888"} />
              ))}
            </div>
          </div>

          {/* Period */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, opacity: 0.5, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>
              {lang === "jp" ? "開発期間" : "Dev Period"}
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>{period}</div>
          </div>

          {/* Motivation */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, opacity: 0.5, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>
              {lang === "jp" ? "動機" : "Motivation"}
            </div>
            <div style={{ fontSize: "0.88rem", lineHeight: 1.6, opacity: 0.85 }}>{motivation}</div>
          </div>

          {/* Pain point */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, opacity: 0.5, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>
              {lang === "jp" ? "苦労した点" : "Challenges"}
            </div>
            <div style={{ fontSize: "0.88rem", lineHeight: 1.6, opacity: 0.85 }}>{painPoint}</div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
          <a
            href={work.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 20px",
              borderRadius: "999px",
              background: "rgba(31,143,255,0.25)",
              border: "1px solid rgba(31,143,255,0.5)",
              color: "#6bbeff",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <GlobeIcon size={14} />
            {lang === "jp" ? "サイトを見る ↗" : "Visit Site ↗"}
          </a>
          {work.githubUrl && (
            <a
              href={work.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 20px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#ccc",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <GitHubIcon size={14} />
              {lang === "jp" ? "GitHubを見る ↗" : "View on GitHub ↗"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card (horizontal) ────────────────────────────────────────────────────────

function WorkCard({ work, onDetail }: { work: Work; onDetail: () => void }) {
  const [hovered, setHovered] = useState(false);
  const { lang } = useLang();

  const title = (lang === "en" && work.titleEn) ? work.titleEn : work.title;
  const description = (lang === "en" && work.descriptionEn) ? work.descriptionEn : work.description;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "row",
        height: "180px",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.13)",
        boxShadow: hovered ? "0 10px 30px rgba(31,143,255,0.3)" : "0 4px 18px rgba(0,0,0,0.2)",
        transform: hovered ? "translateY(-3px)" : "none",
        transition: "transform 0.22s, box-shadow 0.22s",
      }}
    >
      {/* Screenshot — click opens detail modal */}
      <div
        onClick={onDetail}
        style={{ display: "block", flexShrink: 0, width: "200px", cursor: "pointer" }}
      >
        <img
          src={work.screenshot}
          alt={title}
          style={{ width: "200px", height: "180px", objectFit: "cover", objectPosition: "top", display: "block" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Content — click opens detail modal */}
      <div
        onClick={onDetail}
        style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px", minWidth: 0, cursor: "pointer" }}
      >
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
          <a
            href={work.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, textDecoration: "none", color: "inherit" }}
          >
            {title} ↗
          </a>
          <Label text={work.price} color={work.price === "無料" ? "#4fbf8d" : "#ffb84d"} />
        </div>

        {/* Platform icons + release date */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {work.types.map((t) => {
              const m = TYPE_META[t];
              const href =
                t === "web" ? work.url :
                t === "iOS" ? work.iosUrl :
                t === "Android" ? work.androidUrl :
                undefined;
              const label = href ? m.label : `${m.label}${lang === "jp" ? "（準備中）" : " (coming soon)"}`;
              const inner = (
                <>
                  <m.Icon size={15} />
                  {m.label}
                </>
              );
              return href ? (
                <a
                  key={t}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    color: m.color,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {inner}
                </a>
              ) : (
                <span
                  key={t}
                  title={label}
                  style={{
                    color: m.color,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    opacity: 0.45,
                    cursor: "default",
                  }}
                >
                  {inner}
                </span>
              );
            })}
          </div>
          <span style={{ fontSize: "0.75rem", opacity: 0.55 }}>📅 {work.releaseDate}</span>
        </div>

        {/* Description */}
        <p style={{
          margin: 0, fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.5,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {description}
        </p>

        {/* Footer */}
        <div style={{ marginTop: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDetail(); }}
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "inherit",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {lang === "jp" ? "詳細 ▾" : "Details ▾"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sort helper ───────────────────────────────────────────────────────────────

function releaseDateToNum(d: string): number {
  const [y, m] = d.split(".").map(Number);
  return y * 100 + (m || 0);
}

const sortedWorks = [...works].sort(
  (a, b) => releaseDateToNum(b.releaseDate) - releaseDateToNum(a.releaseDate)
);

// ── Section ───────────────────────────────────────────────────────────────────

type FilterType = "all" | "web" | "iOS" | "Android";

export default function WorksSection() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [modalWork, setModalWork] = useState<Work | null>(null);
  const { lang } = useLang();

  const filtered =
    filter === "all"
      ? sortedWorks
      : sortedWorks.filter((w) => w.types.includes(filter as Work["types"][number]));

  const filterOptions: { labelJp: string; labelEn: string; value: FilterType; Icon?: (p: { size?: number }) => React.ReactElement }[] = [
    { labelJp: "すべて", labelEn: "All",     value: "all" },
    { labelJp: "Web",    labelEn: "Web",     value: "web",     Icon: GlobeIcon },
    { labelJp: "iOS",    labelEn: "iOS",     value: "iOS",     Icon: IOSIcon },
    { labelJp: "Android",labelEn: "Android", value: "Android", Icon: AndroidIcon },
  ];

  return (
    <section style={{ padding: "48px 24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "28px", flexWrap: "wrap", gap: "12px",
      }}>
        <h2 style={{ fontSize: "2rem", margin: 0, letterSpacing: "0.05em" }}>🎡 Works</h2>

        <div style={{ display: "flex", gap: "6px" }}>
          {filterOptions.map(({ labelJp, labelEn, value, Icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 14px",
                borderRadius: "999px",
                border: filter === value
                  ? "1px solid rgba(31,143,255,0.6)"
                  : "1px solid rgba(255,255,255,0.2)",
                background: filter === value
                  ? "rgba(31,143,255,0.22)"
                  : "rgba(255,255,255,0.06)",
                color: filter === value
                  ? (Icon ? TYPE_META[value]?.color ?? "#fff" : "#fff")
                  : "inherit",
                fontSize: "0.83rem",
                fontWeight: filter === value ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {Icon && <Icon size={14} />}
              {lang === "jp" ? labelJp : labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {filtered.map((w) => (
          <WorkCard key={w.url} work={w} onDetail={() => setModalWork(w)} />
        ))}
      </div>

      {/* Modal */}
      {modalWork && <WorkModal work={modalWork} onClose={() => setModalWork(null)} />}
    </section>
  );
}
