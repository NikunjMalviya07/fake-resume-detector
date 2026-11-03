import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Loader2, FileX } from "lucide-react";
import { getHistory, deleteResume } from "../api";
import Card from "../components/Card";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getHistory()
      .then((d) => setItems(Array.isArray(d) ? d : d?.resumes ?? d?.history ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this resume analysis? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteResume(id);
      setItems((list) => list.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Resume history</h1>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center py-14 text-center">
          <FileX className="h-10 w-10 text-slate-500" />
          <p className="mt-3 font-medium">No resumes yet</p>
          <Link to="/dashboard" className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-600">Upload your first resume</Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r._id} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-blue-500/50">
              <Link to={`/resume/${r._id}`} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.structuredData?.name || "Unnamed candidate"}</p>
                  <p className="truncate text-sm text-slate-400">{r.filename}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold">{r.score?.finalScore ?? "—"}<span className="text-slate-500">/100</span></span>
                  <span className="text-slate-400">{r.createdAt && new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
              <button onClick={() => handleDelete(r._id)} disabled={deletingId === r._id} aria-label="Delete" className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50">
                {deletingId === r._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}