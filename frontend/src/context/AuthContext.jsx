import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.getHistory()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  const pickName = (res) => res?.user?.name ?? res?.name ?? "";

  async function signIn(body) {
    const res = await api.login(body);
    setName(pickName(res));
    setAuthed(true);
  }
  async function signUp(body) {
    const res = await api.signup(body);
    setName(pickName(res));
    setAuthed(true);
  }
  async function signOut() {
    try { await api.logout(); } finally { setAuthed(false); setName(""); }
  }

  return (
    <AuthContext.Provider value={{ authed, name, checking, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);