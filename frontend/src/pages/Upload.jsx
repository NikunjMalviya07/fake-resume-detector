import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { uploadResume } from "../api";
import Card from "../components/Card";

const STEPS = ["Reading the PDF", "Extracting details", "Checking college records", "Checking GitHub activity", "Contacting companies"];

function Progress() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const step = STEPS[Math.min(Math.floor(seconds / 8), STEPS.length - 1)];
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="font-semibold">{step}…</p>
      <p className="text-sm text-slate-400">This takes 20–60 seconds. Please don’t close this page. ({seconds}s)</p>
    </div>
  );
}

export default function Upload() {
  const navigate = useNavigate();
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function pick(f) {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }
    setError("");
    setFile(f);
  }

  async function handleUpload() {
    setLoading(true);
    setError("");
    try {
      const data = await uploadResume(file);
      navigate(`/resume/${data._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Check a resume</h1>
      <p className="mb-6 text-sm text-slate-400">Upload a PDF to verify its claims and get a credibility score.</p>

      <Card>
        {loading ? <Progress /> : (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
              className={`flex flex-col items-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors ${drag ? "border-blue-500 bg-blue-500/10" : "border-slate-700"}`}
            >
              <UploadCloud className="h-10 w-10 text-blue-500" />
              <p className="mt-3 font-medium">Drag and drop a PDF here</p>
              <input ref={input} type="file" accept="application/pdf" className="hidden" onChange={(e) => pick(e.target.files[0])} />
              <button onClick={() => input.current.click()} className="mt-4 rounded-xl border border-blue-500/50 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10">Browse files</button>
            </div>

            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-blue-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-slate-400">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                </div>
                <button onClick={() => { setFile(null); input.current.value = ""; }} aria-label="Remove file"><X className="h-4 w-4 text-slate-400" /></button>
              </div>
            )}

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <button disabled={!file} onClick={handleUpload} className="mt-4 h-11 w-full rounded-xl bg-blue-500 font-semibold hover:bg-blue-600 disabled:opacity-40">
              Analyze resume
            </button>
          </>
        )}
      </Card>
    </div>
  );
}