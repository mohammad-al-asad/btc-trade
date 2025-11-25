const BitcoinInfo = () => {
  const bitcoinData = {
    marketCap: "$1.747",
    fullyDilutedMarketCap: "$1.837",
    marketDominance: "58.4616%",
    volume: "$68.80B",
    volumeMarketCap: "3.95%",
    circulatingSupply: "19,953,446 BTC",
    maxSupply: "21,000,000 BTC",
    totalSupply: "19,953,446 BTC",
    platformConcentration: "0.60",
    issueDate: "2009-01-02",
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6"># Bitcoin</h1>

      {/* Rank Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">## Rank</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex justify-between  pb-2">
              <span className="font-medium text-gray-400">
                Market Capitalization
              </span>
              <span>{bitcoinData.marketCap}</span>
            </div>
            <div className="flex justify-between  pb-2">
              <span className="font-medium text-gray-400">
                Fully Diluted Market Cap
              </span>
              <span>{bitcoinData.fullyDilutedMarketCap}</span>
            </div>
            <div className="flex justify-between  pb-2">
              <span className="font-medium text-gray-400">
                Market Dominance
              </span>
              <span>{bitcoinData.marketDominance}</span>
            </div>
            <div className="flex justify-between  pb-2">
              <span className="font-medium text-gray-400">Volume</span>
              <span>{bitcoinData.volume}</span>
            </div>
            <div className="flex justify-between  pb-2">
              <span className="font-medium text-gray-400">
                Volume/Market Cap
              </span>
              <span>{bitcoinData.volumeMarketCap}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between pb-2">
              <span className="font-medium text-gray-400">
                Circulating Supply
              </span>
              <span>{bitcoinData.circulatingSupply}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium text-gray-400">Maximum Supply</span>
              <span>{bitcoinData.maxSupply}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium text-gray-400">Total Supply</span>
              <span>{bitcoinData.totalSupply}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium text-gray-400">
                Platform Concentration
              </span>
              <span>{bitcoinData.platformConcentration}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium text-gray-400">Issue Date</span>
              <span>{bitcoinData.issueDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 pt-4  ">
        <p className="text-sm text-gray-600 text-center">
          * Underlying data is sourced and provided by CMC and is for reference
          only. This information is presented on an 'as is' basis and does not
          serve as any form of representation or guarantee by Binance.
        </p>
      </div>
    </div>
  );
};

export default BitcoinInfo;
