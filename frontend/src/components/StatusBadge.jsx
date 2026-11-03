const MAP = {
  pass:           { label: "Verified",                       cls: "text-green-400 bg-green-500/10 border-green-500/30" },
  fail:           { label: "Not verified",                   cls: "text-red-400 bg-red-500/10 border-red-500/30" },
  partial:        { label: "Partial match",                  cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  pending:        { label: "Awaiting company reply",         cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  uncertain:      { label: "Uncertain",                      cls: "text-slate-300 bg-slate-500/10 border-slate-500/30" },
  not_recognized: { label: "Not recognized",                 cls: "text-slate-300 bg-slate-500/10 border-slate-500/30" },
  not_mentioned:  { label: "Not mentioned",                  cls: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] ?? { label: status ?? "Unknown", cls: MAP.uncertain.cls };
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}