export default function SectionCheck({ label, found }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "7px 10px", borderRadius: "7px", marginBottom: "6px",
      background: found ? "#052e16" : "#1a0a0a",
      border: `1px solid ${found ? "#166534" : "#450a0a"}`,
    }}>
      <span style={{ color: found ? "#4ade80" : "#f87171", fontSize: "14px" }}>{found ? "✓" : "✗"}</span>
      <span style={{ color: found ? "#4ade80" : "#f87171", fontSize: "12px", fontFamily: "monospace" }}>{label}</span>
    </div>
  );
}