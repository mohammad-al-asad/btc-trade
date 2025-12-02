/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import TradePanel from "./trade";
import Header from "./header";
import BitcoinInfo from "./info";
import { useSize } from "../lib/hook";
import { getModifiedBtc } from "../lib/clientUtility";
import { usePrice } from "../lib/store";
import TradeHistory from "./history";

export default function TradingPage({ btcModify }: { btcModify: string }) {
  const [price, setPrice] = useState<number | null>(null);
  const size = useSize();
  const [candleData, setCandleData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: any[]; asks: any[] }>({
    bids: [],
    asks: [],
  });
  const [timeframe, setTimeframe] = useState("1d");
  const [isConnected, setIsConnected] = useState(false);
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
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      initializeCharts();
    }, 100);
  }, [isChartInitialized]);

  const initializeCharts = () => {
    if (!chartContainerRef.current || isChartInitialized) return;

    try {
      cleanupCharts(); // Cleanup any existing charts first

      // MAIN CANDLESTICK CHART
      const chart = createChart(chartContainerRef.current, {
        layout: {
          // Binance-like dark background and text
          background: { color: "rgb(24,26,31)" },
          textColor: "#cfd2d3",
        },
        grid: {
          vertLines: { color: "#1f2328" },
          horzLines: { color: "#1f2328" },
        },
        width: chartContainerRef.current.clientWidth,
        height: size == "SM" ? 220 : size == "MD" ? 280 : 400,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "#1f2328",
        },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: "#0ecb81",
        downColor: "#f6465d",
        borderVisible: false,
        wickUpColor: "#0ecb81",
        wickDownColor: "#f6465d",
      });

      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;

      // VOLUME CHART
      if (volumeChartContainerRef.current) {
        const volumeChart: any = createChart(volumeChartContainerRef.current, {
          layout: {
            background: { color: "rgb(24,26,31)" },
            textColor: "#cfd2d3",
          },
          grid: {
            vertLines: { color: "#1f2328" },
            horzLines: { color: "#1f2328" },
          },
          width: volumeChartContainerRef.current.clientWidth,
          height: size == "SM" ? 80 : size == "MD" ? 110 : 150,
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
            borderColor: "#1f2328",
          },
        });

        const volumeSeries = volumeChart.addHistogramSeries({
          color: "#0ecb81",
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
    if (
      candleSeriesRef.current &&
      candleData.length > 0 &&
      isChartInitialized
    ) {
      try {
        candleSeriesRef.current.setData(candleData);

        // ZOOM IN - Show only last 30 candles for better view
        if (candleData.length > 50) {
          setTimeout(() => {
            chartRef.current?.timeScale().setVisibleRange({
              from: candleData[candleData.length - 50].time,
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
    if (
      volumeSeriesRef.current &&
      volumeData.length > 0 &&
      isChartInitialized
    ) {
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
        open: getModifiedBtc(btcModify, candle[1]),
        high: getModifiedBtc(btcModify, candle[2]),
        low: getModifiedBtc(btcModify, candle[3]),
        close: getModifiedBtc(btcModify, candle[4]),
      }));

      const formattedVolume = data.map((candle: any) => ({
        time: Math.floor(candle[0] / 1000),
        value: getModifiedBtc(btcModify, candle[5]),
        color:
          parseFloat(candle[4]) >= parseFloat(candle[1])
            ? "#0ecb81"
            : "#f6465d",
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
      const avgClose =
        closes.reduce((sum: number, close: number) => sum + close, 0) /
        closes.length;

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
    [tradeWsRef, klineWsRef, depthWsRef].forEach((wsRef) => {
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

      const ws = new WebSocket(
        "wss://stream.binance.com:9443/ws/btcusdt@trade"
      );

      ws.onopen = () => {
        console.log("Trade WebSocket connected");
        setIsConnected(true);
        setChartError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const modifiedPrice = getModifiedBtc(btcModify, data.p);

          setPrice((prev) => {
            setPreviousPrice(prev);
            return modifiedPrice;
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
        setTimeout(() => {
          if (
            !tradeWsRef.current ||
            tradeWsRef.current.readyState === WebSocket.CLOSED
          ) {
            setupTradeWebSocket();
          }
        }, 5000);
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
            open: getModifiedBtc(btcModify, kline.o),
            high: getModifiedBtc(btcModify, kline.h),
            low: getModifiedBtc(btcModify, kline.l),
            close: getModifiedBtc(btcModify, kline.c),
          };

          const newVolume = {
            time: Math.floor(kline.t / 1000),
            value: getModifiedBtc(btcModify, kline.v),
            color:
              parseFloat(kline.c) >= parseFloat(kline.o)
                ? "#0ecb81"
                : "#f6465d",
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
        setTimeout(() => {
          if (
            !klineWsRef.current ||
            klineWsRef.current.readyState === WebSocket.CLOSED
          ) {
            setupKlineWebSocket();
          }
        }, 5000);
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
        setTimeout(() => {
          if (
            !depthWsRef.current ||
            depthWsRef.current.readyState === WebSocket.CLOSED
          ) {
            setupDepthWebSocket();
          }
        }, 5000);
      };

      depthWsRef.current = ws;
    } catch (error) {
      console.error("Error setting up depth WebSocket:", error);
    }
  };

  // Load data when timeframe changes
  useEffect(() => {
    fetchHistoricalData();
  }, [timeframe]);

  // Setup WebSockets when on Chart tab
  useEffect(() => {
    setupWebSockets();
    return () => {
      // Cleanup WebSockets when component unmounts or tab changes
      cleanupWebSockets();
    };
  }, [timeframe]);

  const timeframes = [
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "15m", label: "15m" },
    { value: "1h", label: "1h" },
    { value: "4h", label: "4h" },
    { value: "1d", label: "1D" },
  ];

  const getPriceChange = () => {
    if (candleData.length < 2) return { change: 0, percent: 0 };
    const current = candleData[candleData.length - 1]?.close || price || 0;
    const previous = candleData[candleData.length - 2]?.close || current;
    const change = current - previous;
    const percent = previous > 0 ? (change / previous) * 100 : 0;
    return { change, percent };
  };

  const priceChange = getPriceChange();

  const { setPrice: setGolbalPrice } = usePrice((state: any) => state);
  useEffect(() => {
    if (price) {
      setGolbalPrice(price);
    }
  }, [price]);

  return (
    <div className="min-h-screen bg-[rgb(12,14,17)] text-white">
      {/* Connection Status */}
      {/* <div
        className={`p-1 text-center text-xs ${
          isConnected ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {isConnectedå
          ? "Connected to Binance"
          : "Disconnected - Reconnecting..."}
      </div> */}
      <Header />

      <div className="container mx-auto p-2">
        <div>
          {/* Chart Header */}
          <div className="bg-bg  p-2 lg:p-3 rounded-sm md:rounded-md lg:rounded-lg mb-2 w-full">
            <div className="flex flex-col md:flex-row justify-between items-center flex-1  ">
              <div className="grid  grid-cols-2 md:flex gap-2 lg:gap-4 justify-between md:justify-start space-x-4 w-full">
                <div>
                  <h1 className="text-lg lg:ext-xl font-bold">BTC/USDT</h1>
                  <div className="text-xs lg:text-sm text-gray-400">
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
                              ? "#0ecb81"
                              : price < previousPrice
                              ? "#f6465d"
                              : "#0ecb81"
                            : "#0ecb81"
                        }`,
                      }}
                      className={`text-lg text-end lg:text-xl font-semibold `}
                    >
                      $
                      {price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  )}
                </div>
                <div className="text-sm w-full">
                  <div className="flex space-x-4  w-full">
                    <span className="text-xs lg:text-sm">
                      O{" "}
                      {candleData.length > 0
                        ? candleData[candleData.length - 1]?.open.toFixed(4) ||
                          "0.0000"
                        : "0.0000"}
                    </span>
                    <span className="text-xs lg:text-sm">
                      H{" "}
                      {candleData.length > 0
                        ? candleData[candleData.length - 1]?.high.toFixed(4) ||
                          "0.0000"
                        : "0.0000"}
                    </span>
                    <span className="text-xs lg:text-sm">
                      L{" "}
                      {candleData.length > 0
                        ? candleData[candleData.length - 1]?.low.toFixed(4) ||
                          "0.0000"
                        : "0.0000"}
                    </span>
                    <span className="text-xs lg:text-sm ">
                      C {price ? price.toFixed(4) : "0.0000"}
                    </span>
                  </div>
                  <div
                    className={`font-semibold text-[10px] lg:text-xs ${
                      priceChange.change >= 0 ? "text-green" : "text-red"
                    }`}
                  >
                    {priceChange.change >= 0 ? "+" : ""}
                    {priceChange.change.toFixed(4)} (
                    {priceChange.percent >= 0 ? "+" : ""}
                    {priceChange.percent.toFixed(2)}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center  w-full   justify-between md:justify-end space-x-2 mt-3 md:mt-0">
                {/* Timeframe Buttons */}
                <div className="flex bg-[#1f2328] rounded p-1">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.value}
                      onClick={() => setTimeframe(tf.value)}
                      className={`p-1 md:px-2 md:py-1 text-xs rounded ${
                        timeframe === tf.value
                          ? "bg-[#2b3139]"
                          : "hover:bg-[#2b3139]"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                {/* Chart Controls */}
                <button className="p-1 hover:bg-[#2b3139] rounded text-xs">
                  ☐
                </button>
                <button className="p-1 hover:bg-[#2b3139] rounded text-xs ">
                  O
                </button>
                <select className="bg-[#1f2328] rounded px-2 py-1 text-xs">
                  <option>Trading View</option>
                </select>
              </div>
            </div>
            {/* Indicators */}
            <div className="flex space-x-4 text-xs text-gray-400 mt-1 mb-2">
              <div>
                MA 25 close 0{" "}
                <span className="text-white">{indicators.ma25.toFixed(4)}</span>
              </div>
              <div>
                MA 99 close 0{" "}
                <span className="text-white">{indicators.ma99.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
            {/* Chart - 3/4 width */}
            <div className="lg:col-span-3 h-fit rounded-lg ">
              {/* Main Candlestick Chart */}
              <div
                ref={chartContainerRef}
                className=" border-2 border-[#1f2328] bg-[#0b0e11] w-full rounded-t-lg overflow-hidden"
              />

              {/* Volume Chart - BOTTOM OF MAIN CHART */}
              <div
                ref={volumeChartContainerRef}
                className="w-full border-2 border-[#1f2328] bg-[#0b0e11] mt-1 rounded-b-lg overflow-hidden"
              />

              {/* {!isChartInitialized && !chartError && (
                <div className="text-center text-gray-400 py-8">
                  Initializing chart...
                </div>
              )} */}

              <div className="border-[#1f2328] border rounded-md overflow-hidden hidden md:block mt-2">
                <TradeHistory />
              </div>
            </div>

            {/* Sidebar - 1/4 width */}
            <div className="space-y-2 lg:space-y-2 ">
              <TradePanel price={Number(price)} />

              {/* Order Book */}
              <div className="h-[440px] overflow-y-auto">
                <div className="bg-bg rounded-lg p-4 border border-[#1f2328] max-h-[500px] h-[500px]! overflow-hidden">
                  <h3 className="text-base lg:text-lg font-semibold mb-2 lg:mb-4">
                    Order Book
                  </h3>

                  <div className="space-y-1 text-xs">
                    {orderBook.asks.map((ask: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between text-red"
                      >
                        <span>{ask.price.toFixed(2)}</span>
                        <span>{ask.quantity.toFixed(6)}</span>
                      </div>
                    ))}

                    <div className="text-center text-gray-400 my-2 border-t border-b border-[#1f2328] py-1">
                      Spread:
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
                        className="flex justify-between text-green"
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
        </div>
      </div>
    </div>
  );
}
