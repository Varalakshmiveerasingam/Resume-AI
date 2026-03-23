export default function Badge({ text, color }) {
  const palettes = {
    blue:   { bg: "#0f2a4a", fg: "#60a5fa", border: "#1d4ed8" },
    green:  { bg: "#052e16", fg: "#4ade80", border: "#166534" },
    amber:  { bg: "#3d1f00", fg: "#fbbf24", border: "#92400e" },
    purple: { bg: "#1e0740", fg: "#c084fc", border: "#6b21a8" },
  };
  const c = palettes[color] || palettes.blue;
  return (
    <span style={{
      background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
      borderRadius: "6px", padding: "3px 10px", fontSize: "12px",
      fontFamily: "monospace", display: "inline-block", margin: "3px 3px 3px 0",
    }}>{text}</span>
  );
}