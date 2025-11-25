export async function getUserAssets() {
  const res = await fetch("api/assets", { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch BTC price");

  return res.json();
}
