import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Field from "../components/Field";

export default function Login() {
  const { authed, signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (authed) return <Navigate to="/dashboard" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <Field label="Email" type="email" value={form.email} onChange={set("email")} required />
        <Field label="Password" type="password" value={form.password} onChange={set("password")} required />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 font-semibold hover:bg-blue-600 disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Login
        </button>
        <p className="text-center text-sm text-slate-400">
          New here? <Link to="/signup" className="text-blue-400">Create an account</Link>
        </p>
      </form>
    </div>
  );
}