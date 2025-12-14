const cancelFutureTradeOrder = async () => {
try {
    const serverUrl = "https://www.sorafunded.com";
  const res = await fetch(`${serverUrl}/api/trade/future/auto-cancel`, {
    method: "PUT",
  });
  const data = await res.json();
  console.log(data);
} catch (error) {
  console.log(error);
  
}
  
};

setInterval(() => {
  cancelFutureTradeOrder();
}, 10000);
