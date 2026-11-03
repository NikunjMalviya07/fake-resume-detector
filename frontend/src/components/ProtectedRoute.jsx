import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

export default function ProtectedRoute() {
  const { authed, checking } = useAuth();

  if (checking) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }
  if (!authed) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl p-4 sm:p-6"><Outlet /></main>
    </>
  );
}