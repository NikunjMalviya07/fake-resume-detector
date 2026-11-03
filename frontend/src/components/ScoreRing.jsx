export default function ScoreRing({ score = 0, bucket }) {
  const color =
    bucket === "High credibility" ? "#22c55e" :
    bucket === "Needs review" ? "#f5b301" :
    bucket === "High risk" ? "#ef4444" : "#64748b";
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-label={`Score ${score} out of 100`}>
        <circle cx="64" cy="64" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 64 64)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-none">{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}