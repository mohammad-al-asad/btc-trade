async function getBTCPrice(dateString) {
  const timestampMs = new Date(dateString).getTime();

  console.log({timestampMs})
  const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&startTime=${timestampMs}&limit=1`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data || data.length === 0) return null;

  const c = data[0];
  return {
    open: parseFloat(c[1]),
    close: parseFloat(c[4]),
  };
}

// Call the function and log the result
getBTCPrice("2024-11-25 05:30:00")
  .then((price) => console.log(price))
  .catch((err) => console.error(err));
