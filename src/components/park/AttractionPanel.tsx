import { CATALOG, ALL_ATTRACTION_TYPES } from "./catalog";
import type { AttractionType, PlacedAttraction, AudienceType } from "./types";
import { useLang } from "../../contexts/LanguageContext";

const AUDIENCE_EMOJI: Record<AudienceType, string> = { family: "👨‍👩‍👧", couple: "💑", solo: "🧍" };
const AUDIENCE_LABEL_JP: Record<AudienceType, string> = { family: "子連れ向き", couple: "カップル向き", solo: "ひとり向き" };
const AUDIENCE_LABEL_EN: Record<AudienceType, string> = { family: "Family", couple: "Couples", solo: "Solo" };
const AUDIENCE_BG: Record<AudienceType, string> = { family: "rgba(255,140,160,0.25)", couple: "rgba(180,120,255,0.25)", solo: "rgba(100,170,255,0.25)" };
const AUDIENCE_BORDER: Record<AudienceType, string> = { family: "rgba(255,140,160,0.5)", couple: "rgba(180,120,255,0.5)", solo: "rgba(100,170,255,0.5)" };

interface Props {
  money: number;
  totalVisitors: number;
  placingType: AttractionType | null;
  onSelect: (type: AttractionType | null) => void;
  attractions: PlacedAttraction[];
  expanded: boolean;
  onToggle: () => void;
}

export default function AttractionPanel({ money, totalVisitors, placingType, onSelect, attractions, expanded, onToggle }: Props) {
  const { lang } = useLang();
  const showDetail = placingType !== null;
  const showList = expanded && !showDetail;

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
    width: "190px",
  };

  const detailEntry = placingType ? CATALOG[placingType] : null;
  const detailCount = placingType ? attractions.filter(a => a.type === placingType).length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "8px" }}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          ...btnBase,
          border: (expanded || showDetail) ? "1px solid rgba(31,143,255,0.55)" : "1px solid rgba(255,255,255,0.2)",
          background: (expanded || showDetail) ? "rgba(31,143,255,0.28)" : "rgba(0,0,0,0.65)",
        }}
      >
        🏗 {lang === "jp" ? "アトラクション配置" : "Build"}
      </button>

      {/* Slide-out panel */}
      <div
        style={{
          maxWidth: (showDetail || showList) ? "260px" : "0",
          maxHeight: showDetail ? "280px" : showList ? "70vh" : "0",
          opacity: (showDetail || showList) ? 1 : 0,
          overflow: "hidden",
          transition: "max-width 0.28s ease, max-height 0.32s ease, opacity 0.2s ease",
          background: "rgba(0,0,0,0.75)",
          borderRadius: "12px",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
          flexShrink: 0,
        }}
      >
        {/* ── Detail view (placement mode) ── */}
        {showDetail && detailEntry && (
          <div style={{ width: "240px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Back button */}
            <button
              onClick={() => onSelect(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.72rem",
                cursor: "pointer",
                alignSelf: "flex-start",
              }}
            >
              ← {lang === "jp" ? "戻る" : "Back"}
            </button>

            {/* Attraction header */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.6rem" }}>{detailEntry.emoji}</span>
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff" }}>
                  {lang === "jp" ? detailEntry.name : detailEntry.nameEn}
                </div>
                {detailCount > 0 && (
                  <div style={{ fontSize: "0.65rem", color: "#ffaa44" }}>
                    {lang === "jp" ? `既存 ${detailCount}基` : `${detailCount} existing`}
                  </div>
                )}
              </div>
            </div>

            {/* Audience badges */}
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {detailEntry.audience.map(t => (
                <span
                  key={t}
                  style={{
                    fontSize: "0.68rem",
                    padding: "2px 7px",
                    borderRadius: "20px",
                    background: AUDIENCE_BG[t],
                    border: `1px solid ${AUDIENCE_BORDER[t]}`,
                    color: "#fff",
                  }}
                >
                  {AUDIENCE_EMOJI[t]} {lang === "jp" ? AUDIENCE_LABEL_JP[t] : AUDIENCE_LABEL_EN[t]}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)" }}>
                💰 ${detailEntry.cost}
                {" · "}
                <span style={{ color: "#7dffb3" }}>
                  👥 +{detailCount > 0
                    ? Math.round(detailEntry.visitors * Math.pow(0.5, detailCount))
                    : detailEntry.visitors}
                  {detailCount > 0 && (
                    <span style={{ color: "#ff9966", marginLeft: "3px" }}>
                      ({(Math.pow(0.5, detailCount) * 100).toFixed(0)}%)
                    </span>
                  )}
                </span>
                {" · "}
                <span style={{ color: "#ff7d7d" }}>
                  {lang === "jp" ? "維持" : "maint"} ${detailEntry.maintenance}
                </span>
              </div>
            </div>

            {/* Place hint */}
            <div style={{
              fontSize: "0.7rem",
              color: "#ffea8f",
              padding: "5px 8px",
              background: "rgba(255,234,143,0.08)",
              borderRadius: "6px",
              border: "1px solid rgba(255,234,143,0.2)",
            }}>
              {lang === "jp" ? "公園内をクリックして設置" : "Click in the park to place"}
            </div>
          </div>
        )}

        {/* ── List view ── */}
        {showList && (
          <div
            style={{
              width: "240px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              maxHeight: "calc(100vh * 0.7 - 72px)",
              overflowY: "auto",
            }}
          >
            {ALL_ATTRACTION_TYPES.map((type) => {
              const entry = CATALOG[type];
              const isLocked = entry.unlockAt !== undefined && totalVisitors < entry.unlockAt;
              const canAfford = !isLocked && money >= entry.cost;
              const isSelected = placingType === type;
              const existingCount = attractions.filter(a => a.type === type).length;
              const effectiveVisitors = existingCount > 0
                ? Math.round(entry.visitors * Math.pow(0.5, existingCount))
                : entry.visitors;
              const hasPenalty = existingCount > 0;
              return (
                <button
                  key={type}
                  onClick={() => !isLocked && onSelect(isSelected ? null : type)}
                  disabled={!canAfford}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: isSelected ? "2px solid #1f8fff" : isLocked ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.14)",
                    background: isSelected
                      ? "rgba(31,143,255,0.3)"
                      : isLocked ? "rgba(255,255,255,0.02)"
                      : canAfford ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                    color: isLocked ? "rgba(255,255,255,0.2)" : canAfford ? "#fff" : "rgba(255,255,255,0.32)",
                    cursor: isLocked ? "default" : canAfford ? "pointer" : "not-allowed",
                    textAlign: "left",
                    width: "100%",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{isLocked ? "🔒" : entry.emoji}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1px", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        {lang === "jp" ? entry.name : entry.nameEn}
                      </span>
                      {existingCount > 0 && (
                        <span style={{ fontSize: "0.62rem", color: "#ffaa44", opacity: 0.85 }}>
                          ×{existingCount}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.68rem", opacity: 0.7 }}>
                      {isLocked ? (
                        <span style={{ color: "#ffaa44" }}>
                          {lang === "jp" ? `累計${entry.unlockAt!.toLocaleString()}人でアンロック` : `Unlock at ${entry.unlockAt!.toLocaleString()} visitors`}
                        </span>
                      ) : (
                        <>
                          ${entry.cost}
                          {" · "}
                          <span style={{ color: "#7dffb3" }}>
                            👥+{effectiveVisitors}
                            {hasPenalty && (
                              <span style={{ color: "#ff9966", marginLeft: "2px" }}>
                                ({(Math.pow(0.5, existingCount) * 100).toFixed(0)}%)
                              </span>
                            )}
                          </span>
                          {" · "}
                          <span style={{ color: "#ff7d7d" }}>{lang === "jp" ? "維持" : "maint"}${entry.maintenance}</span>
                        </>
                      )}
                    </div>
                    {/* Audience mini-badges */}
                    {!isLocked && (
                      <div style={{ display: "flex", gap: "3px", marginTop: "2px" }}>
                        {entry.audience.map(t => (
                          <span
                            key={t}
                            title={lang === "jp" ? AUDIENCE_LABEL_JP[t] : AUDIENCE_LABEL_EN[t]}
                            style={{
                              fontSize: "0.6rem",
                              padding: "1px 5px",
                              borderRadius: "12px",
                              background: AUDIENCE_BG[t],
                              border: `1px solid ${AUDIENCE_BORDER[t]}`,
                              color: "#fff",
                            }}
                          >
                            {AUDIENCE_EMOJI[t]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
