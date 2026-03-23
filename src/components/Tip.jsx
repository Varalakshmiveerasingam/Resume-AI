export default function Tip({ tip }) {
  const map = {
    high:   { color: "#f87171", border: "#991b1b", label: "HIGH" },
    medium: { color: "#fbbf24", border: "#92400e", label: "MED"  },
    low:    { color: "#4ade80", border: "#166534", label: "LOW"  },
  };
  const p = map[tip.priority] || map.low;
  return (
    <div style={{ display: "flex", gap: "14px", marginBottom: "18px" }}>
      <span style={{
        background: "#0a0f1a", border: `1px solid ${p.border}`, color: p.color,
        borderRadius: "5px", padding: "2px 7px", fontSize: "10px",
        fontWeight: "700", whiteSpace: "nowrap", marginTop: "2px",
      }}>{p.label}</span>
      <div>
        <div style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{tip.title}</div>
        <div style={{ color: "#64748b", fontSize: "12px", lineHeight: "1.7" }}>{tip.detail}</div>
      </div>
    </div>
  );
}