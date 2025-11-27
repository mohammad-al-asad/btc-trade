/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import TradePanel from "./trade";
import Header from "./header";
import BitcoinInfo from "./info";

export default function TradingPage({ btcModify }: { btcModify: string }) {
  const [price, setPrice] = useState<number | null>(null);
  const [candleData, setCandleData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: any[]; asks: any[] }>({
    bids: [],
    asks: [],
  });
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("1d");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Chart");
  const [chartError, setChartError] = useState<string | null>(null);
  const [isChartInitialized, setIsChartInitialized] = useState(false);

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
  const tradeWsRef = useRef<WebSocket | null>(null);
  const klineWsRef = useRef<WebSocket | null>(null);
  const depthWsRef = useRef<WebSocket | null>(null);

  // Initialize chart - WITH PROPER CLEANUP
  useEffect(() => {
    if (chartContainerRef.current && !isChartInitialized) {
      initializeCharts();
    }

    return () => {
      // Cleanup charts when component unmounts
      cleanupCharts();
    };
  }, [isChartInitialized]);

  // Reinitialize charts when tab changes back to Chart
  useEffect(() => {
    if (selectedTab === "Chart" && !isChartInitialized) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializeCharts();
      }, 100);
    }
  }, [selectedTab, isChartInitialized]);

  const initializeCharts = () => {
    if (!chartContainerRef.current || isChartInitialized) return;

    try {
      cleanupCharts(); // Cleanup any existing charts first

      // MAIN CANDLESTICK CHART
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: "#1e293b" },
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
          borderColor: "#374151",
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

      // VOLUME CHART
      if (volumeChartContainerRef.current) {
        const volumeChart :any = createChart(volumeChartContainerRef.current, {
          layout: {
            background: { color: "#1e293b" },
            textColor: "#d1d5db",
          },
          grid: {
            vertLines: { color: "#374151" },
            horzLines: { color: "#374151" },
          },
          width: volumeChartContainerRef.current.clientWidth,
          height: 150,
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
            borderColor: "#374151",
          },
        });

        const volumeSeries = volumeChart.addHistogramSeries({
          color: "#26a69a",
          priceFormat: {
            type: "volume",
          },
          priceScaleId: "",
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });

        volumeChartRef.current = volumeChart;
        volumeSeriesRef.current = volumeSeries;

        // Sync time scale between main chart and volume chart
        chart.timeScale().subscribeVisibleTimeRangeChange((timeRange: any) => {
          volumeChart.timeScale().setVisibleRange(timeRange);
        });
      }

      // Handle window resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
        if (volumeChartContainerRef.current && volumeChartRef.current) {
          volumeChartRef.current.applyOptions({
            width: volumeChartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener("resize", handleResize);

      setIsChartInitialized(true);
      setChartError(null);

      // Set chart data if we already have data
      if (candleData.length > 0 && candleSeriesRef.current) {
        candleSeriesRef.current.setData(candleData);
      }
      if (volumeData.length > 0 && volumeSeriesRef.current) {
        volumeSeriesRef.current.setData(volumeData);
      }

    } catch (error) {
      console.error("Chart initialization error:", error);
      setChartError("Failed to initialize chart");
      setIsChartInitialized(false);
    }
  };

  const cleanupCharts = () => {
    // Cleanup main chart
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (error) {
        console.error("Error removing main chart:", error);
      }
      chartRef.current = null;
    }

    // Cleanup volume chart
    if (volumeChartRef.current) {
      try {
        volumeChartRef.current.remove();
      } catch (error) {
        console.error("Error removing volume chart:", error);
      }
      volumeChartRef.current = null;
    }

    candleSeriesRef.current = null;
    volumeSeriesRef.current = null;
    setIsChartInitialized(false);
  };

  // Update chart data when candleData changes
  useEffect(() => {
    if (candleSeriesRef.current && candleData.length > 0 && isChartInitialized) {
      try {
        candleSeriesRef.current.setData(candleData);
        
        // ZOOM IN - Show only last 30 candles for better view
        if (candleData.length > 30) {
          setTimeout(() => {
            chartRef.current?.timeScale().setVisibleRange({
              from: candleData[candleData.length - 30].time,
              to: candleData[candleData.length - 1].time,
            });
          }, 100);
        }
      } catch (error) {
        console.error("Error setting chart data:", error);
      }
    }
  }, [candleData, isChartInitialized]);

  // Update volume data
  useEffect(() => {
    if (volumeSeriesRef.current && volumeData.length > 0 && isChartInitialized) {
      try {
        volumeSeriesRef.current.setData(volumeData);
      } catch (error) {
        console.error("Error setting volume data:", error);
      }
    }
  }, [volumeData, isChartInitialized]);

  // Fetch historical data
  const fetchHistoricalData = async () => {
    try {
      setChartError(null);
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${timeframe}&limit=100`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      const formattedCandles = data.map((candle: any) => ({
        time: Math.floor(candle[0] / 1000),
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
      }));

      const formattedVolume = data.map((candle: any) => ({
        time: Math.floor(candle[0] / 1000),
        value: parseFloat(candle[5]),
        color: parseFloat(candle[4]) >= parseFloat(candle[1]) ? "#26a69a" : "#ef5350",
      }));

      setCandleData(formattedCandles);
      setVolumeData(formattedVolume);

      if (formattedCandles.length > 0) {
        const lastCandle = formattedCandles[formattedCandles.length - 1];
        setPrice(lastCandle.close);
        setPreviousPrice(lastCandle.close);
      }

      // Calculate indicators
      const closes = formattedCandles.map((candle: any) => candle.close);
      const avgClose = closes.reduce((sum: number, close: number) => sum + close, 0) / closes.length;

      setIndicators({
        ma25: avgClose,
        ma99: avgClose * 1.2,
      });
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setChartError("Failed to load historical data");
    }
  };

  // WebSocket connections with proper cleanup
  const setupWebSockets = () => {
    setupTradeWebSocket();
    setupKlineWebSocket();
    setupDepthWebSocket();
  };

  const cleanupWebSockets = () => {
    [tradeWsRef, klineWsRef, depthWsRef].forEach(wsRef => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    });
    setIsConnected(false);
  };

  const setupTradeWebSocket = () => {
    try {
      if (tradeWsRef.current) {
        tradeWsRef.current.close();
      }

      const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

      ws.onopen = () => {
        console.log("Trade WebSocket connected");
        setIsConnected(true);
        setChartError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const price = parseFloat(data.p);
          const btcModifyFloat = parseFloat(btcModify);
          let latestPrice: number;
          
          if (btcModifyFloat < 0) {
            latestPrice = price - Math.abs(btcModifyFloat);
          } else {
            latestPrice = btcModifyFloat + price;
          }
          
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
        setChartError("WebSocket connection error");
      };

      ws.onclose = (event) => {
        console.log("Trade WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        // Only reconnect if we're still on the Chart tab
        if (selectedTab === "Chart") {
          setTimeout(() => {
            if (!tradeWsRef.current || tradeWsRef.current.readyState === WebSocket.CLOSED) {
              setupTradeWebSocket();
            }
          }, 5000);
        }
      };

      tradeWsRef.current = ws;
    } catch (error) {
      console.error("Error setting up trade WebSocket:", error);
      setChartError("Failed to setup WebSocket connection");
    }
  };

  const setupKlineWebSocket = () => {
    try {
      if (klineWsRef.current) {
        klineWsRef.current.close();
      }

      const interval = timeframe === "1d" ? "1d" 
        : timeframe === "4h" ? "4h" 
        : timeframe === "1h" ? "1h" 
        : timeframe === "15m" ? "15m" 
        : "1m";

      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`
      );

      ws.onopen = () => {
        console.log("Kline WebSocket connected");
        setChartError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const kline = data.k;

          const newCandle = {
            time: Math.floor(kline.t / 1000),
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
          };

          const newVolume = {
            time: Math.floor(kline.t / 1000),
            value: parseFloat(kline.v),
            color: parseFloat(kline.c) >= parseFloat(kline.o) ? "#26a69a" : "#ef5350",
          };

          if (kline.x) {
            // Candle closed
            setCandleData((prev) => {
              const newData = [...prev, newCandle];
              return newData.slice(-100);
            });
            setVolumeData((prev) => {
              const newData = [...prev, newVolume];
              return newData.slice(-100);
            });
          } else {
            // Update current candle
            setCandleData((prev) => {
              if (prev.length === 0) return [newCandle];
              const newData = [...prev.slice(0, -1), newCandle];
              return newData;
            });
            setVolumeData((prev) => {
              if (prev.length === 0) return [newVolume];
              const newData = [...prev.slice(0, -1), newVolume];
              return newData;
            });
          }
        } catch (error) {
          console.error("Error processing kline data:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("Kline WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log("Kline WebSocket closed:", event.code, event.reason);
        // Only reconnect if we're still on the Chart tab
        if (selectedTab === "Chart") {
          setTimeout(() => {
            if (!klineWsRef.current || klineWsRef.current.readyState === WebSocket.CLOSED) {
              setupKlineWebSocket();
            }
          }, 5000);
        }
      };

      klineWsRef.current = ws;
    } catch (error) {
      console.error("Error setting up kline WebSocket:", error);
    }
  };

  const setupDepthWebSocket = () => {
    try {
      if (depthWsRef.current) {
        depthWsRef.current.close();
      }

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

      ws.onerror = (error) => {
        console.error("Depth WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log("Depth WebSocket closed:", event.code, event.reason);
        // Only reconnect if we're still on the Chart tab
        if (selectedTab === "Chart") {
          setTimeout(() => {
            if (!depthWsRef.current || depthWsRef.current.readyState === WebSocket.CLOSED) {
              setupDepthWebSocket();
            }
          }, 5000);
        }
      };

      depthWsRef.current = ws;
    } catch (error) {
      console.error("Error setting up depth WebSocket:", error);
    }
  };

  // Load data when timeframe changes
  useEffect(() => {
    if (selectedTab === "Chart") {
      fetchHistoricalData();
    }
  }, [timeframe, selectedTab]);

  // Setup WebSockets when on Chart tab
  useEffect(() => {
    if (selectedTab === "Chart") {
      setupWebSockets();
    } else {
      // Cleanup WebSockets when not on Chart tab
      cleanupWebSockets();
    }

    return () => {
      // Cleanup WebSockets when component unmounts or tab changes
      cleanupWebSockets();
    };
  }, [selectedTab, timeframe]);

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
    const current = candleData[candleData.length - 1]?.close || price || 0;
    const previous = candleData[candleData.length - 2]?.close || current;
    const change = current - previous;
    const percent = previous > 0 ? (change / previous) * 100 : 0;
    return { change, percent };
  };

  const priceChange = getPriceChange();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Connection Status */}
      {/* <div
        className={`p-1 text-center text-xs ${
          isConnected ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {isConnected
          ? "Connected to Binance"
          : "Disconnected - Reconnecting..."}
      </div> */}
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
            {/* Error Display */}
            {/* {chartError && (
              <div className="bg-red-600 text-white p-3 rounded mb-4">
                {chartError}
              </div>
            )} */}

            {/* Chart Header */}
            <div className="flex flex-wrap justify-between items-center mb-2">
              <div className="grid grid-cols-2 md:flex gap-4 items-start space-x-4">
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
                          previousPrice !== null
                            ? price > previousPrice
                              ? "#2ebd85"
                              : price < previousPrice
                              ? "#f6465d"
                              : "#2ebd85"
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
                        ? candleData[candleData.length - 1]?.open.toFixed(4) || "0.0000"
                        : "0.0000"}
                    </span>
                    <span>
                      H{" "}
                      {candleData.length > 0
                        ? candleData[candleData.length - 1]?.high.toFixed(4) || "0.0000"
                        : "0.0000"}
                    </span>
                    <span>
                      L{" "}
                      {candleData.length > 0
                        ? candleData[candleData.length - 1]?.low.toFixed(4) || "0.0000"
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

              <div className="flex items-center justify-between md:justify-start space-x-2 mt-4 md:mt-0">
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
              <div className="lg:col-span-3 rounded-lg md:p-4 ">
                {/* Main Candlestick Chart */}
                <div
                  ref={chartContainerRef}
                  className="w-full border-2 border-gray-700 bg-gray-800"
                  style={{ height: '400px' }}
                />
                
                {/* Volume Chart - BOTTOM OF MAIN CHART */}
                <div
                  ref={volumeChartContainerRef}
                  className="w-full border-2 border-gray-700 bg-gray-800 mt-2"
                  style={{ height: '150px' }}
                />
                
                {!isChartInitialized && !chartError && (
                  <div className="text-center text-gray-400 py-8">
                    Initializing chart...
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-400 text-center">
                  {new Date().toLocaleTimeString()} UTC
                </div>
              </div>

              {/* Sidebar - 1/4 width */}
              <div className="space-y-4">
                <TradePanel price={Number(price)} />

                {/* Order Book */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Order Book</h3>

                  <div className="space-y-1 text-xs">
                    {orderBook.asks.map((ask: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between text-red-400"
                      >
                        <span>{ask.price.toFixed(2)}</span>
                        <span>{ask.quantity.toFixed(6)}</span>
                      </div>
                    ))}

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
              </div>
            </div>
          </div>
        )}
        {selectedTab == "Info" && <BitcoinInfo />}
      </div>
    </div>
  );
}