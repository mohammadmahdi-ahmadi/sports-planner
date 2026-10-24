const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(localStorage.getItem("sportPlannerToken") ? { Authorization: `Bearer ${localStorage.getItem("sportPlannerToken")}` } : {}), ...options.headers },
  });
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.error || "The API request failed.");
  return payload;
}
