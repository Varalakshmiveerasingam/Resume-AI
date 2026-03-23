export default function Card({ children, borderColor, style }) {
  return (
    <div style={{
      background: "#0d1424", border: `1px solid ${borderColor || "#1e293b"}`,
      borderRadius: "12px", padding: "20px 22px", marginBottom: "16px", ...style,
    }}>{children}</div>
  );
}