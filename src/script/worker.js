const cancelFutureTradeOrder = async() => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const res = fetch(`${serverUrl}/api/trade/future/auto-cancel`, {
    method: "PUT",
  });
  const data = await res.json()
  console.log({data});
  
};

setInterval(() => {
  cancelFutureTradeOrder();
}, 10000);
