export default function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-300">{label}</span>
      <input
        {...props}
        className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500"
      />
    </label>
  );
}