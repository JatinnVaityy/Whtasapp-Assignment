export function formatTimestamp(ts) {
  if (!ts) return "";
  // ts expected to be unix seconds string or number
  const n = parseInt(ts, 10);
  if (Number.isNaN(n)) return ts;
  const date = new Date(n * 1000);
  const now = new Date();
  if (date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString();
}
