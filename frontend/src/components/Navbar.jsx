import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { name, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  const link = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? "bg-blue-500/10 text-blue-400" : "text-slate-300 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold">
          <ShieldCheck className="h-6 w-6 text-blue-500" /> Resume Guard
        </Link>

        <nav className="ml-6 hidden gap-1 md:flex">
          <NavLink to="/dashboard" className={link}>Upload</NavLink>
          <NavLink to="/history" className={link}>History</NavLink>
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {name && <span className="text-sm text-slate-400">{name}</span>}
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-blue-500">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <button className="ml-auto md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-slate-800 px-4 py-3 md:hidden" onClick={() => setOpen(false)}>
          <NavLink to="/dashboard" className={link}>Upload</NavLink>
          <NavLink to="/history" className={link}>History</NavLink>
          <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm text-slate-300">Logout</button>
        </div>
      )}
    </header>
  );
}