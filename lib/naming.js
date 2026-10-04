export function uid(n = 6) {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10);
  return out;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function prettyDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const AUTO_COLORS = ["Gold", "Silver", "Rose", "Pearl", "Emerald", "Ruby"];

export function autoName(category) {
  const c = AUTO_COLORS[Math.floor(Math.random() * AUTO_COLORS.length)];
  return `JWL-2026-${uid(3)}-${c.toUpperCase()}-${(category || "PIECE").toUpperCase()}`;
}

export function autoSku(name, category) {
  const letters =
    (name || "JWL").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() ||
    "JW";
  const catCode = (category || "GEN").slice(0, 2).toUpperCase();
  return `${letters}-${catCode}-${uid(3)}`;
}

export function newShootId() {
  return `SHOOT-${todayISO()}-${uid(6)}`;
}
