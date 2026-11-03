export default function Card({ title, right, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}