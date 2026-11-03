import { Link } from "react-router-dom";
import { ShieldCheck, GraduationCap, GitBranch, Building2 } from "lucide-react";

const FEATURES = [
  { icon: GraduationCap, title: "Education checks", text: "College and student records are compared with what the resume claims." },
  { icon: GitBranch, title: "GitHub evidence", text: "Projects are checked against real repositories and commit history." },
  { icon: Building2, title: "Employer confirmation", text: "Companies are emailed and confirm or deny the work history." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-10%,rgba(59,130,246,0.25),transparent_55%)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2 font-bold"><ShieldCheck className="h-6 w-6 text-blue-500" /> Resume Guard</span>
        <div className="flex gap-2">
          <Link to="/login" className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:border-blue-500">Login</Link>
          <Link to="/signup" className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-600">Sign Up</Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">Check a resume before you trust it</h1>
        <p className="mt-5 text-slate-400">
          Upload a resume PDF. Resume Guard cross-checks it against college records, GitHub activity and
          direct company confirmation, then gives a transparent 0–100 credibility score.
        </p>
        <Link to="/signup" className="mt-8 inline-block rounded-xl bg-blue-500 px-6 py-3 font-semibold hover:bg-blue-600">Get started</Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Icon className="h-6 w-6 text-blue-500" />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}