const cancelFutureTradeOrder = async() => {
  const serverUrl ="https://www.sorafunded.com";
  const res = await fetch(`${serverUrl}/api/trade/future/auto-cancel`, {
    method: "PUT",
  });
  const data = await res.json()
  
};

setInterval(() => {
  cancelFutureTradeOrder();
}, 10000);
