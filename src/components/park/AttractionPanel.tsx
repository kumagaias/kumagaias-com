import { useState } from "react";
import { CATALOG, ALL_ATTRACTION_TYPES } from "./catalog";
import type { AttractionType } from "./types";
import { useLang } from "../../contexts/LanguageContext";

interface Props {
  money: number;
  placingType: AttractionType | null;
  onSelect: (type: AttractionType | null) => void;
}

export default function AttractionPanel({ money, placingType, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { lang } = useLang();

  const btnBase: React.CSSProperties = {
    padding: "10px 18px",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    whiteSpace: "nowrap",
    flexShrink: 0,
    textAlign: "left",
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "8px" }}>
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          ...btnBase,
          border: expanded ? "1px solid rgba(31,143,255,0.55)" : "1px solid rgba(255,255,255,0.2)",
          background: expanded ? "rgba(31,143,255,0.28)" : "rgba(0,0,0,0.65)",
        }}
      >
        🏗 {lang === "jp" ? "アトラクション配置" : "Build"}
      </button>

      {/* Slide-out panel */}
      <div
        style={{
          maxWidth: expanded ? "220px" : "0",
          maxHeight: expanded ? "70vh" : "0",
          opacity: expanded ? 1 : 0,
          overflow: "hidden",
          transition: "max-width 0.28s ease, max-height 0.28s ease, opacity 0.2s ease",
          background: "rgba(0,0,0,0.75)",
          borderRadius: "12px",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "200px",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            maxHeight: "calc(100vh * 0.7 - 72px)",
            overflowY: "auto",
          }}
        >
          {placingType && (
            <div style={{
              fontSize: "0.7rem", color: "#ffea8f", textAlign: "center",
              padding: "2px 0 4px", borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              {lang === "jp" ? "公園内をクリックして設置" : "Click in the park to place"}
            </div>
          )}
          {ALL_ATTRACTION_TYPES.map((type) => {
            const entry = CATALOG[type];
            const canAfford = money >= entry.cost;
            const isSelected = placingType === type;
            return (
              <button
                key={type}
                onClick={() => onSelect(isSelected ? null : type)}
                disabled={!canAfford}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 10px",
                  borderRadius: "8px",
                  border: isSelected ? "2px solid #1f8fff" : "1px solid rgba(255,255,255,0.14)",
                  background: isSelected
                    ? "rgba(31,143,255,0.3)"
                    : canAfford ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                  color: canAfford ? "#fff" : "rgba(255,255,255,0.32)",
                  cursor: canAfford ? "pointer" : "not-allowed",
                  textAlign: "left",
                  width: "100%",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{entry.emoji}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    {lang === "jp" ? entry.name : entry.nameEn}
                  </div>
                  <div style={{ fontSize: "0.68rem", opacity: 0.7 }}>
                    ${entry.cost} · 👥+{entry.visitors}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
