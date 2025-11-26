/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// pages/trading.js
import { useState, useEffect, useRef } from "react";

// Import the library correctly
import { createChart } from "lightweight-charts";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import TradePanel from "./trade";
import Header from "./header";
import BitcoinInfo from "./info";

export default function TradingPage() {
  const { data: session, status } = useSession();
  // const router = useRouter();
  const [price, setPrice] = useState<number | null>(null);
  const [candleData, setCandleData] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: any[]; asks: any[] }>({
    bids: [],
    asks: [],
  });
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("1d");
  const [quantity, setQuantity] = useState("0.001");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Chart");
  const [indicators, setIndicators] = useState({
    ma25: 2.0771,
    ma99: 2.6543,
  });
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  const chartContainerRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeChartContainerRef = useRef<any>(null);
  const volumeChartRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const tradeWsRef = useRef<any>(null);
  const klineWsRef = useRef<any>(null);
  const depthWsRef = useRef<any>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current && chartContainerRef.current) {
      // MAIN CHART
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: "#0000" },
          textColor: "#d1d5db",
        },
        grid: {
          vertLines: { color: "#374151" },
          horzLines: { color: "#374151" },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;

      // ------------------------------------
      // ✔ CREATE VOLUME CHART AFTER MAIN CHART EXISTS
      // ------------------------------------
      if (volumeChartContainerRef.current) {
        const volumeChart = createChart(volumeChartContainerRef.current, {
          layout: {
            background: { color: "#0000" },
            textColor: "#d1d5db",
          },
          grid: {
            vertLines: { color: "#374151" },
            horzLines: { color: "#374151" },
          },
          width: volumeChartContainerRef.current.clientWidth,
          height: 120,
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
        });

        const volumeSeries = volumeChart.addHistogramSeries({
          priceFormat: { type: "volume" },
          priceScaleId: "",
          scaleMargins: { top: 0.1, bottom: 0 },
        });

        volumeChartRef.current = volumeChart;
        volumeSeriesRef.current = volumeSeries;

        // ✔ sync scroll
        chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
          try {
            volumeChart.timeScale().setVisibleRange(range);
          } catch {}
        });
      }

      // Resize
      const resize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
        if (volumeChartContainerRef.current) {
          volumeChartRef.current?.applyOptions({
            width: volumeChartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener("resize", resize);

      return () => {
        window.removeEventListener("resize", resize);
        chart.remove();
        volumeChartRef.current?.remove();
      };
    }
  }, []);

  // Update chart data when candleData changes
  useEffect(() => {
    if (candleSeriesRef.current && candleData.length > 0) {
      candleSeriesRef.current.setData(candleData);
    }
    if (candleData.length > 50) {
      chartRef.current?.timeScale().setVisibleRange({
        from: candleData[candleData.length - 50].time,
        to: candleData[candleData.length - 1].time,
      });
    }
  }, [candleData]);

  // Fetch initial historical data
  useEffect(() => {
    fetchHistoricalData();
  }, [timeframe]);

  // WebSocket connections
  useEffect(() => {
    setupTradeWebSocket();
    setupKlineWebSocket();
    setupDepthWebSocket();

    return () => {
      if (tradeWsRef.current) tradeWsRef.current.close();
      if (klineWsRef.current) klineWsRef.current.close();
      if (depthWsRef.current) depthWsRef.current.close();
    };
  }, [timeframe]);

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${timeframe}&limit=100`
      );
      const data = await response.json();

      const formattedCandles = data.map((candle: any) => ({
        time: Math.floor(candle[0] / 1000), // Convert to seconds
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
      }));
      const formattedVolume = data.map((candle: any) => ({
        time: Math.floor(candle[0] / 1000),
        value: parseFloat(candle[5]),
        color:
          parseFloat(candle[4]) >= parseFloat(candle[1])
            ? "#26a69a"
            : "#ef5350",
      }));
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.setData(formattedVolume);
      }

      // const formattedVolume = data.map((candle: any) => ({
      //   time: Math.floor(candle[0] / 1000),
      //   value: parseFloat(candle[5]),
      //   color:
      //     parseFloat(candle[4]) >= parseFloat(candle[1])
      //       ? "#26a69a"
      //       : "#ef5350",
      // }));

      setCandleData(formattedCandles);

      // if (volumeSeriesRef.current) {
      //   volumeSeriesRef.current.setData(formattedVolume);
      // }

      if (formattedCandles.length > 0) {
        const lastCandle = formattedCandles[formattedCandles.length - 1];
        setPrice(lastCandle.close);
      }

      // Calculate mock indicators
      const closes = formattedCandles.map((candle: any) => candle.close);
      const avgClose =
        closes.reduce((sum: number, close: any) => sum + close, 0) /
        closes.length;

      setIndicators({
        ma25: avgClose,
        ma99: avgClose * 1.2,
      });
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  const setupTradeWebSocket = () => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

    ws.onopen = () => {
      console.log("Trade WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const latestPrice = parseFloat(data.p);

        setPrice((prev) => {
          setPreviousPrice(prev);
          return latestPrice;
        });

        setRecentTrades((prev) => {
          const newTrades = [
            {
              id: data.t,
              price: latestPrice,
              quantity: parseFloat(data.q),
              time: new Date(data.T).toLocaleTimeString(),
              isBuyerMaker: data.m,
            },
            ...prev.slice(0, 9),
          ];
          return newTrades;
        });
      } catch (error) {
        console.error("Error processing trade data:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Trade WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("Trade WebSocket disconnected");
      setIsConnected(false);
      setTimeout(() => setupTradeWebSocket(), 3000);
    };

    tradeWsRef.current = ws;
  };

  const setupKlineWebSocket = () => {
    const interval =
      timeframe === "1d"
        ? "1d"
        : timeframe === "4h"
        ? "4h"
        : timeframe === "1h"
        ? "1h"
        : timeframe === "15m"
        ? "15m"
        : "1m";

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const kline = data.k;

        if (kline.x) {
          // If candle is closed
          const newCandle = {
            time: Math.floor(kline.t / 1000),
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
          };

          setCandleData((prev) => {
            const newData = [...prev.slice(1), newCandle];
            return newData;
          });
        } else {
          // Update current candle
          const updatingCandle = {
            time: Math.floor(kline.t / 1000),
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
          };

          // Update the last candle in the series
          setCandleData((prev) => {
            if (prev.length === 0) return [updatingCandle];
            const newData = [...prev.slice(0, -1), updatingCandle];
            return newData;
          });
        }
      } catch (error) {
        console.error("Error processing kline data:", error);
      }
    };

    klineWsRef.current = ws;
  };

  const setupDepthWebSocket = () => {
    const ws = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms"
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setOrderBook({
          bids: data.bids.slice(0, 10).map((bid: any) => ({
            price: parseFloat(bid[0]),
            quantity: parseFloat(bid[1]),
          })),
          asks: data.asks.slice(0, 10).map((ask: any) => ({
            price: parseFloat(ask[0]),
            quantity: parseFloat(ask[1]),
          })),
        });
      } catch (error) {
        console.error("Error processing depth data:", error);
      }
    };

    depthWsRef.current = ws;
  };

  const timeframes = [
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "15m", label: "15m" },
    { value: "1h", label: "1h" },
    { value: "4h", label: "4h" },
    { value: "1d", label: "1D" },
  ];

  const tabs = ["Chart", "Info"];

  const getPriceChange = () => {
    if (candleData.length < 2) return { change: 0, percent: 0 };
    const current = candleData[candleData.length - 1].close;
    const previous = candleData[candleData.length - 2].close;
    const change = current - previous;
    const percent = (change / previous) * 100;
    return { change, percent };
  };

  const priceChange = getPriceChange();

  // Format time for display
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };



  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Connection Status */}
      <div
        className={`p-1 text-center text-xs ${
          isConnected ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {isConnected
          ? "Connected to Binance"
          : "Disconnected - Reconnecting..."}
      </div>
      <Header />

      <div className="container mx-auto p-2">
        {/* Top Navigation Tabs */}
        <div className="flex border-b border-gray-600 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium ${
                selectedTab === tab
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {selectedTab == "Chart" && (
          <div>
            {/* Chart Header */}
            <div className="flex flex-wrap justify-between items-center mb-2">
              <div className="flex items-start space-x-4">
                <div>
                  <h1 className="text-xl font-bold">BTC/USDT</h1>
                  <div className="text-sm text-gray-400">
                    {timeframe.toUpperCase()} · Binance
                  </div>
                </div>
                <div>
                  {price && (
                    <div
                      style={{
                        color: `${
                          price! > previousPrice!
                            ? "#2ebd85"
                            : price! < previousPrice!
                            ? "#f6465d"
                            : "#2ebd85"
                        }`,
                      }}
                      className={`text-xl font-semibold `}
                    >
                      $
                      {price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <div className="flex space-x-4">
                    <span>
                      O{" "}
                      {candleData.length > 0
                        ? candleData[candleData.length - 1].open.toFixed(4)
                        : "0.0000"}
                    </span>
                    <span>
                      H{" "}
                      {candleData.length > 0
                        ? candleData[candleData.length - 1].high.toFixed(4)
                        : "0.0000"}
                    </span>
                    <span>
                      L{" "}
                      {candleData.length > 0
                        ? candleData[candleData.length - 1].low.toFixed(4)
                        : "0.0000"}
                    </span>
                    <span>C {price ? price.toFixed(4) : "0.0000"}</span>
                  </div>
                  <div
                    className={`font-semibold ${
                      priceChange.change >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {priceChange.change >= 0 ? "+" : ""}
                    {priceChange.change.toFixed(4)} (
                    {priceChange.percent >= 0 ? "+" : ""}
                    {priceChange.percent.toFixed(2)}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Timeframe Buttons */}
                <div className="flex bg-gray-800 rounded p-1">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.value}
                      onClick={() => setTimeframe(tf.value)}
                      className={`px-2 py-1 text-xs rounded ${
                        timeframe === tf.value
                          ? "bg-gray-600"
                          : "hover:bg-gray-700"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                {/* Chart Controls */}
                <button className="p-1 hover:bg-gray-700 rounded">☐</button>
                <button className="p-1 hover:bg-gray-700 rounded">O</button>
                <select className="bg-gray-800 rounded px-2 py-1 text-xs">
                  <option>Trading View</option>
                </select>
              </div>
            </div>

            {/* Indicators */}
            <div className="flex space-x-4 text-xs text-gray-400 mb-2">
              <div>
                MA 25 close 0{" "}
                <span className="text-white">{indicators.ma25.toFixed(4)}</span>
              </div>
              <div>
                MA 99 close 0{" "}
                <span className="text-white">{indicators.ma99.toFixed(4)}</span>
              </div>
            </div>

            {/* Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Chart - 3/4 width */}
              <div className="lg:col-span-3  rounded-lg p-4">
                <div
                  ref={chartContainerRef}
                  className="w-full border-2 border-gray-700 bg-gray-800 "
                />
                {/* GPT - add a new chart just show volume */}
                <div
                  ref={volumeChartContainerRef}
                  className="w-full h-40 border-2 border-gray-700 bg-gray-800 mt-2"
                />

                <div className="mt-4 text-xs text-gray-400 text-center">
                  {new Date().toLocaleTimeString()} UTC
                </div>
              </div>

              {/* Sidebar - 1/4 width */}
              <div className="space-y-4">
                {/* Trading Panel */}
                <TradePanel price={Number(price)} />

                {/* Order Book */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Order Book</h3>

                  <div className="space-y-1 text-xs">
                    {/* Asks */}
                    {orderBook.asks.map((ask: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between text-red-400"
                      >
                        <span>{ask.price.toFixed(2)}</span>
                        <span>{ask.quantity.toFixed(6)}</span>
                      </div>
                    ))}

                    {/* Spread */}
                    <div className="text-center text-gray-400 my-2 border-t border-b border-gray-600 py-1">
                      Spread:{" "}
                      {orderBook.bids.length > 0 && orderBook.asks.length > 0
                        ? (
                            ((orderBook.asks[0].price -
                              orderBook.bids[0].price) /
                              orderBook.bids[0].price) *
                            100
                          ).toFixed(4) + "%"
                        : "0%"}
                    </div>

                    {/* Bids */}
                    {orderBook.bids.map((bid: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between text-green-400"
                      >
                        <span>{bid.price.toFixed(2)}</span>
                        <span>{bid.quantity.toFixed(6)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Trades */}
                {/* <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>

              <div className="space-y-1 max-h-40 overflow-y-auto text-xs">
                {recentTrades.map((trade, index) => (
                  <div key={trade.id || index} className="flex justify-between">
                    <span
                      className={
                        trade.isBuyerMaker ? "text-red-400" : "text-green-400"
                      }
                    >
                      {trade.price.toFixed(2)}
                    </span>
                    <span className="text-gray-400">
                      {trade.quantity.toFixed(6)}
                    </span>
                    <span className="text-gray-500">{trade.time}</span>
                  </div>
                ))}
              </div>
            </div> */}
              </div>
            </div>
          </div>
        )}
        {selectedTab == "Info" && <BitcoinInfo />}
      </div>
    </div>
  );
}
