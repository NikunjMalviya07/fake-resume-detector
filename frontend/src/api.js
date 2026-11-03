const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:2862";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { credentials: "include", ...options });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const json = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const signup = (body) => request("/api/auth/signup", json("POST", body));
export const login = (body) => request("/api/auth/login", json("POST", body));
export const logout = () => request("/api/auth/logout", { method: "POST" });

export function uploadResume(file) {
  const fd = new FormData();
  fd.append("file", file); // field name must be "file"
  return request("/api/resume/upload", { method: "POST", body: fd });
}
export const getResume = (id) => request(`/api/resume/${id}`);
export const getHistory = () => request("/api/resume/history");
export const deleteResume = (id) => request(`/api/resume/${id}`, { method: "DELETE" });