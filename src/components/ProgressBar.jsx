export default function ProgressBar({ value, max, color }) {
  return (
    <div style={{ background: "#1e293b", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
      <div style={{
        width: `${(Math.min(value, max) / max) * 100}%`, height: "100%",
        background: color, borderRadius: "4px",
        transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}