import { works } from "../data/works";
import type { Work } from "../data/works";

function WorkCard({ work }: { work: Work }) {
  return (
    <a
      href={work.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(8px)",
        borderRadius: "16px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.25s, box-shadow 0.25s",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-6px) scale(1.02)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
      }}
    >
      <img
        src={work.screenshot}
        alt={work.title}
        style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <div style={{ padding: "16px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>{work.title}</h3>
        <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8, lineHeight: 1.5 }}>
          {work.description}
        </p>
      </div>
    </a>
  );
}

export default function WorksSection() {
  return (
    <section
      style={{
        padding: "48px 24px",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "2rem",
          marginBottom: "32px",
          letterSpacing: "0.05em",
        }}
      >
        🎡 Works
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {works.map((w) => (
          <WorkCard key={w.url} work={w} />
        ))}
      </div>
    </section>
  );
}
