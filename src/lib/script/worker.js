const cancelFutureTradeOrder = () => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  fetch(`${serverUrl}/api/trade/future/auto-cancel`, {
    method: "UPDATE",
  });
};
