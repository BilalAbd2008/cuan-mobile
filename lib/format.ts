export function formatShortRp(value: number) {
  const n = Math.round(value);
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1000) return `Rp ${Math.round(n / 1000)}K`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function greetingForHour(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 19) return "Selamat Sore";
  return "Selamat Malam";
}

export function monthLabelYyyyMm(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-").map(Number);
  if (!y || !m) return "";
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}
