import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { getResume } from "../api";
import Card from "../components/Card";
import ScoreRing from "../components/ScoreRing";
import StatusBadge from "../components/StatusBadge";

const pct = (n) => (typeof n === "number" ? `${Math.round(n * 100)}%` : "—");

export default function Result() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      setData(await getResume(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  if (error && !data) return <p className="rounded-xl border border-red-500/40 p-4 text-red-300">{error}</p>;

  const s = data?.structuredData ?? {};
  const v = data?.verification ?? {};
  const edu = v.education, rec = v.studentRecord, gh = v.github;
  const exp = v.experience ?? [];
  const hasPending = exp.some((e) => e.status === "pending");

  return (
    <div className="space-y-5">
      <Link to="/history" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> History</Link>

      {/* Score */}
      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ScoreRing score={data?.score?.finalScore ?? 0} bucket={data?.score?.bucket} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">{s.name || "Unnamed candidate"}</h1>
            <p className="text-sm text-slate-400">{data?.filename} · {data?.createdAt && new Date(data.createdAt).toLocaleDateString()}</p>
            <p className="mt-2 text-lg font-semibold">{data?.score?.bucket ?? "Not assessed"}</p>
          </div>
        </div>
        {data?.score?.disclaimer && <p className="mt-4 text-xs text-slate-400">{data.score.disclaimer}</p>}
      </Card>

      {/* Candidate info */}
      <Card title="Candidate details">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[["Email", s.email], ["Phone", s.phone], ["College", s.college], ["Degree", s.degree], ["CGPA", s.cgpa], ["Passing year", s.passingYear]].map(([k, val]) => (
            <div key={k}><dt className="text-xs text-slate-400">{k}</dt><dd className="break-words font-medium">{val || "—"}</dd></div>
          ))}
        </dl>
        {s.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {s.skills.map((k) => <span key={k} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs">{k}</span>)}
          </div>
        )}
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Education verification" right={<StatusBadge status={edu?.status} />}>
          <p>Matched institution: <strong>{edu?.matchedInstitution || "None found"}</strong></p>
          <p className="mt-1 text-sm text-slate-400">Confidence {pct(edu?.confidence)} · Degree {edu?.degreeMatch ? "matches" : "not confirmed"}</p>
        </Card>

        <Card title="Candidate record match" right={<StatusBadge status={rec?.status} />}>
          {rec?.matchedRecord
            ? <p>Found: <strong>{rec.matchedRecord.name}</strong>, {rec.matchedRecord.college}</p>
            : <p className="text-slate-400">No matching candidate record.</p>}
          <ul className="mt-3 space-y-2">
            {Object.entries(rec?.checks ?? {}).map(([k, val]) => (
              <li key={k} className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm capitalize last:border-0">
                {k.replace(/Match$/, "").replace(/([A-Z])/g, " $1").toLowerCase()} <StatusBadge status={val} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* GitHub */}
      <Card title="GitHub verification" right={<StatusBadge status={gh?.status} />}>
        {gh?.profile ? (
          <p>
            <a className="text-blue-400" href={gh.profile.profileUrl} target="_blank" rel="noreferrer">@{gh.profile.username}</a>
            <span className="text-sm text-slate-400"> · {gh.profile.publicRepos} public repos · joined {gh.profile.accountCreated?.slice(0, 4)}</span>
          </p>
        ) : <p className="text-slate-400">No GitHub profile found on the resume.</p>}

        {gh?.skillMatch && (
          <p className="mt-2 text-sm text-slate-400">
            Skills seen in repos: {gh.skillMatch.matchedSkills?.join(", ") || "none"} ({pct(gh.skillMatch.ratio)})
          </p>
        )}

        <h3 className="mb-2 mt-5 text-sm font-semibold">Projects</h3>
        {gh?.projectChecks?.length ? (
          <ul className="space-y-3">
            {gh.projectChecks.map((p, i) => (
              <li key={i} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <strong>{s.projects?.[i]?.title ?? `Project ${i + 1}`}</strong>
                  <StatusBadge status={p.status} />
                </div>
                {p.note && <p className="mt-1 text-sm text-slate-400">{p.note}</p>}
                <p className="mt-1 text-xs text-slate-500">
                  Confidence {pct(p.confidence)}
                  {p.evidence?.commitCount != null && ` · ${p.evidence.commitCount} commits by this candidate`}
                </p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-400">No projects were checked.</p>}
      </Card>

      {/* Experience */}
      <Card title="Work experience verification"
        right={
          <button onClick={() => load(true)} disabled={refreshing} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:border-blue-500 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh status
          </button>
        }>
        {exp.length ? (
          <ul className="space-y-3">
            {exp.map((e, i) => (
              <li key={e.token ?? i} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <strong>{e.company}</strong>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-1 text-sm text-slate-400">{e.role}{e.duration && ` · ${e.duration}`}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-400">No work experience listed on this resume.</p>}
        {hasPending && <p className="mt-3 text-xs text-slate-400">Pending items update after a company replies to our email. Press Refresh status to check.</p>}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </Card>

      {/* Breakdown */}
      <Card title="Score breakdown">
        <ul className="space-y-3">
          {(data?.score?.breakdown ?? []).map((b, i) => (
            <li key={i} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between gap-3">
                <strong>{b.check}</strong>
                <span className="flex items-center gap-2"><span className="text-xs text-slate-500">weight {b.weight}</span><StatusBadge status={b.status} /></span>
              </div>
              {b.note && <p className="mt-1 text-sm text-slate-400">{b.note}</p>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}