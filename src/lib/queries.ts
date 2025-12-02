export async function getUserAssets() {
  const res = await fetch("api/assets", { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch BTC price");

  return res.json();
}

export async function getTradeHistory() {
  const res = await fetch("api/history", { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch Trade History");

  return res.json();
}
export async function getClosedTradeHistory() {
  const res = await fetch("api/history/closed", { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch Trade History");

  return res.json();
}

export async function getBtcModifyData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/btc-modify`);
  const data = await res.json();
  return data.modifyData.adjustment;
}
