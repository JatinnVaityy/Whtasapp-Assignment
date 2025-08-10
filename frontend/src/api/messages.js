const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchConversations() {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function postMessage(payload) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("Failed to post message: " + t);
  }
  return res.json();
}
