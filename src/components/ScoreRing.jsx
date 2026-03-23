import { useState, useEffect } from "react";
export default function ScoreRing({ score, label, size }) {
  const sz = size || 130;
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(score), 200);
    return () => clearTimeout(t);
  }, [score]);
  const r = sz / 2 - 12;
  const circ = 2 * Math.PI * r;
  const filled = (anim / 100) * circ;
  const color = score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";
  const cx = sz / 2;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      <text x={cx} y={cx - 5} textAnchor="middle" fill={color} fontSize="24" fontWeight="700" fontFamily="monospace">{score}</text>
      <text x={cx} y={cx + 13} textAnchor="middle" fill="#475569" fontSize="10" fontFamily="monospace" letterSpacing="1">{label}</text>
    </svg>
  );
}