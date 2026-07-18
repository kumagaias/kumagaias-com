import { useState } from "react";
import { works } from "../data/works";
import type { Work } from "../data/works";
import { useLang } from "../contexts/LanguageContext";
import { AndroidIcon, CLIIcon, GlobeIcon, IOSIcon } from "./works/icons";
import WorkCard from "./works/WorkCard";
import WorkModal from "./works/WorkModal";

type FilterType = "all" | Work["types"][number];

function releaseDateToNum(d: string): number {
  const [y, m] = d.split(".").map(Number);
  return y * 100 + (m || 0);
}

const sortedWorks = [...works].sort((a, b) => releaseDateToNum(b.releaseDate) - releaseDateToNum(a.releaseDate));

export default function WorksSection() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [modalWork, setModalWork] = useState<Work | null>(null);
  const { lang } = useLang();

  const filtered = filter === "all" ? sortedWorks : sortedWorks.filter((w) => w.types.includes(filter));
  const filterOptions: { labelJp: string; labelEn: string; value: FilterType; Icon?: (p: { size?: number }) => React.ReactElement }[] = [
    { labelJp: "すべて", labelEn: "All", value: "all" },
    { labelJp: "Web", labelEn: "Web", value: "web", Icon: GlobeIcon },
    { labelJp: "iOS", labelEn: "iOS", value: "iOS", Icon: IOSIcon },
    { labelJp: "Android", labelEn: "Android", value: "Android", Icon: AndroidIcon },
    { labelJp: "CLI", labelEn: "CLI", value: "CLI", Icon: CLIIcon },
  ];

  return (
    <section id="works" style={{ padding: "64px 24px", maxWidth: "980px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#476c5c" }}>
            Products
          </p>
          <h2 style={{ fontSize: "2rem", margin: 0, letterSpacing: "0.02em" }}>
            {lang === "jp" ? "プロダクト" : "Products"}
          </h2>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {filterOptions.map(({ labelJp, labelEn, value, Icon }) => (
            <button key={value} onClick={() => setFilter(value)} style={{
              display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "999px",
              border: filter === value ? "1px solid rgba(31,45,46,0.32)" : "1px solid rgba(31,45,46,0.16)",
              background: filter === value ? "rgba(31,45,46,0.1)" : "rgba(255,255,255,0.36)",
              color: filter === value ? "#1f2d2e" : "inherit",
              fontSize: "0.83rem", fontWeight: filter === value ? 800 : 600, cursor: "pointer",
            }}>
              {Icon && <Icon size={14} />}
              {lang === "jp" ? labelJp : labelEn}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {filtered.map((w) => <WorkCard key={w.url} work={w} onDetail={() => setModalWork(w)} />)}
      </div>

      {modalWork && <WorkModal key={modalWork.title} work={modalWork} onClose={() => setModalWork(null)} />}
    </section>
  );
}
