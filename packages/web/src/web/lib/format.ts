export function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return `${fmtDate(iso)} · ${fmtTime(iso)}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// deterministic gradient avatar from a seed
const AVATAR_GRADS = [
  "from-[#0b1f4d] to-[#2a4a9c]",
  "from-[#b8860b] to-[#e9c860]",
  "from-[#0f766e] to-[#14b8a6]",
  "from-[#1e3a8a] to-[#3b82f6]",
  "from-[#7c2d12] to-[#ea580c]",
  "from-[#581c87] to-[#a855f7]",
];
export function avatarGrad(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_GRADS[h % AVATAR_GRADS.length];
}

export function fmtNum(n: number) {
  return n.toLocaleString("en-IN");
}
