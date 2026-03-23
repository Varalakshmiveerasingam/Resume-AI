export default function SectionLabel({ icon, text, color }) {
  return (
    <div style={{
      fontSize: "11px", color: color || "#475569",
      letterSpacing: "0.12em", marginBottom: "14px", fontWeight: "700",
    }}>{icon} {text}</div>
  );
}