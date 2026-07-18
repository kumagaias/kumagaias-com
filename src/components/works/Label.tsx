export default function Label({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "0.72rem",
      fontWeight: 700,
      background: color + "18",
      color,
      border: `1px solid ${color}40`,
    }}>
      {text}
    </span>
  );
}
