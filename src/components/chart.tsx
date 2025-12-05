/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef } from "react";
import { createChart, LogicalRange } from "lightweight-charts";
import TradePanel from "./trade";
import Header from "./header";
import TradeHistory from "./history";
import { useSize } from "../lib/hook";
import { getModifiedBtc } from "../lib/clientUtility";
import { usePrice } from "../lib/store";

export default function TradingPage({ btcModify }: { btcModify: string }) {
  const [price, setPrice] = useState<number | null>(null);
  const size = useSize();
  const [candleData, setCandleData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: any[]; asks: any[] }>({ bids: [], asks: [] });
  const [timeframe, setTimeframe] = useState("1d");
  const [chartError, setChartError] = useState<string | null>(null);
  const [indicators, setIndicators] = useState({ ma25: 0, ma99: 0 });
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeChartContainerRef = useRef<HTMLDivElement | null>(null);
  const volumeChartRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  const tradeWsRef = useRef<WebSocket | null>(null);
  const klineWsRef = useRef<WebSocket | null>(null);
  const depthWsRef = useRef<WebSocket | null>(null);

  const isSyncingRef = useRef(false);
  const timescaleUnsubRef = useRef<any>(null);
  const hasInitialFitRef = useRef(false);

  const setGolbalPrice = usePrice((state: any) => state.setPrice);

  // ------------------------- INITIALIZE CHART -------------------------
  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Main Candlestick Chart
      const chart = createChart(chartContainerRef.current, {
        layout: { background: { color: "rgb(24,26,31)" }, textColor: "#cfd2d3" },
        grid: { vertLines: { color: "#1f2328" }, horzLines: { color: "#1f2328" } },
        width: chartContainerRef.current.clientWidth,
        height: size === "SM" ? 220 : size === "MD" ? 280 : 400,
        timeScale: { timeVisible: true, secondsVisible: false, borderColor: "#1f2328" },
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

      // Volume Chart
      if (volumeChartContainerRef.current) {
        const volumeChart:any = createChart(volumeChartContainerRef.current, {
          layout: { background: { color: "rgb(24,26,31)" }, textColor: "#cfd2d3" },
          grid: { vertLines: { color: "#1f2328" }, horzLines: { color: "#1f2328" } },
          width: volumeChartContainerRef.current.clientWidth,
          height: size === "SM" ? 80 : size === "MD" ? 110 : 150,
          timeScale: { timeVisible: true, secondsVisible: false, borderColor: "#1f2328" },
        });

        const volumeSeries = volumeChart.addHistogramSeries({
          color: "#0ecb81",
          priceFormat: { type: "volume" },
          priceScaleId: "",
          scaleMargins: { top: 0.8, bottom: 0 },
        });

        volumeChartRef.current = volumeChart;
        volumeSeriesRef.current = volumeSeries;

        // Sync charts
        const unsubscribe = chart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
          if (!logicalRange || isSyncingRef.current) return;
          isSyncingRef.current = true;
          volumeChart.timeScale().setVisibleLogicalRange(logicalRange);
          setTimeout(() => (isSyncingRef.current = false), 10);
        });
        timescaleUnsubRef.current = unsubscribe;
      }

      // Window resize
      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        volumeChartRef.current?.applyOptions({ width: volumeChartContainerRef.current?.clientWidth });
      };
      window.addEventListener("resize", handleResize);

<<<<<<< HEAD
      setIsChartInitialized(true);
      setChartError(null);

      // Set chart data if we already have data
      if (candleData.length > 0 && candleSeriesRef.current) {
        candleSeriesRef.current.setData(candleData);

        // FIX: Force chart time range update
        const times = candleData.map((c) => c.time);
        if (times.length > 1) {
          chart.timeScale().setVisibleRange({
            from: times[times.length - 30] || times[0],
            to: times[times.length - 1],
          });
        }
      }

      if (volumeData.length > 0 && volumeSeriesRef.current) {
        volumeSeriesRef.current.setData(volumeData);
      }
    } catch (error) {
      console.error("Chart initialization error:", error);
=======
      return () => {
        timescaleUnsubRef.current?.();
        window.removeEventListener("resize", handleResize);
        chart.remove();
        volumeChartRef.current?.remove();
      };
    } catch (err) {
      console.error("Chart init error:", err);
>>>>>>> 1b49fb9d2a6f100732e000f653fd743c6aa72c2d
      setChartError("Failed to initialize chart");
    }
  }, []);

  // ------------------------- UPDATE CANDLE & VOLUME DATA -------------------------
  const updateCandleData = (newCandle: any) => {
    setCandleData((prev) => {
      const last = prev[prev.length - 1];
      let updated;
      if (last && last.time === newCandle.time) {
        updated = [...prev.slice(0, -1), newCandle];
      } else {
        updated = [...prev, newCandle].slice(-100); // max 100 candles
      }
      candleSeriesRef.current?.setData(updated);
      return updated;
    });
  };

  const updateVolumeData = (newVolume: any) => {
    setVolumeData((prev) => {
      const last = prev[prev.length - 1];
      let updated;
      if (last && last.time === newVolume.time) {
        updated = [...prev.slice(0, -1), newVolume];
      } else {
        updated = [...prev, newVolume].slice(-100);
      }
      volumeSeriesRef.current?.setData(updated);
      return updated;
    });
  };

<<<<<<< HEAD
  // Update chart data when candleData changes
  useEffect(() => {
    if (
      candleSeriesRef.current &&
      candleData.length > 0 &&
      isChartInitialized
    ) {
      try {
        candleSeriesRef.current.setData(candleData);

        // FIX: Prevent circular relation error
        const times = candleData.map((c) => c.time);
        if (chartRef.current && times.length > 1) {
          chartRef.current.timeScale().setVisibleRange({
            from: times[times.length - 30] || times[0],
            to: times[times.length - 1],
          });
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
=======
  // ------------------------- FETCH HISTORICAL -------------------------
>>>>>>> 1b49fb9d2a6f100732e000f653fd743c6aa72c2d
  const fetchHistoricalData = async () => {
    try {
      setChartError(null);
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${timeframe}&limit=100`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const formattedCandles = data.map((c: any) => ({
        time: Math.floor(c[0] / 1000),
        open: getModifiedBtc(btcModify, c[1]),
        high: getModifiedBtc(btcModify, c[2]),
        low: getModifiedBtc(btcModify, c[3]),
        close: getModifiedBtc(btcModify, c[4]),
      })).sort((a:any, b:any) => a.time - b.time); // ensure ascending

      const formattedVolume = data.map((c: any) => ({
        time: Math.floor(c[0] / 1000),
        value: getModifiedBtc(btcModify, c[5]),
        color: parseFloat(c[4]) >= parseFloat(c[1]) ? "#0ecb81" : "#f6465d",
      })).sort((a:any, b:any) => a.time - b.time);

      setCandleData(formattedCandles);
      setVolumeData(formattedVolume);

      const lastClose = formattedCandles[formattedCandles.length - 1]?.close;
      if (lastClose) {
        setPrice(lastClose);
        setPreviousPrice(lastClose);
      }

      // Simple indicators
      const closes = formattedCandles.map((c: any) => c.close);
      const avg = closes.reduce((sum:any, v:any) => sum + v, 0) / closes.length;
      setIndicators({ ma25: avg, ma99: avg * 1.2 });
    } catch (err) {
      console.error("Fetch historical error:", err);
      setChartError("Failed to load historical data");
    }
  };

  // ------------------------- WEBSOCKETS -------------------------
  const setupWebSockets = () => {
    // Trade
    if (tradeWsRef.current) tradeWsRef.current.close();
    const tradeWs = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
    tradeWs.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const modifiedPrice = getModifiedBtc(btcModify, data.p);
        setPrice((prev) => {
          setPreviousPrice(prev);
          return modifiedPrice;
        });
      } catch {}
    };
    tradeWsRef.current = tradeWs;

    // Kline
    if (klineWsRef.current) klineWsRef.current.close();
    const klineWs = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${timeframe}`);
    klineWs.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const k = data.k;
        const newCandle = {
          time: Math.floor(k.t / 1000),
          open: getModifiedBtc(btcModify, k.o),
          high: getModifiedBtc(btcModify, k.h),
          low: getModifiedBtc(btcModify, k.l),
          close: getModifiedBtc(btcModify, k.c),
        };
        const newVolume = {
          time: Math.floor(k.t / 1000),
          value: getModifiedBtc(btcModify, k.v),
          color: parseFloat(k.c) >= parseFloat(k.o) ? "#0ecb81" : "#f6465d",
        };

        updateCandleData(newCandle);
        updateVolumeData(newVolume);
      } catch {}
    };
    klineWsRef.current = klineWs;

    // Depth
    if (depthWsRef.current) depthWsRef.current.close();
    const depthWs = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms");
    depthWs.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setOrderBook({
          bids: data.bids.slice(0, 10).map((b: any) => ({ price: parseFloat(b[0]), quantity: parseFloat(b[1]) })),
          asks: data.asks.slice(0, 10).map((a: any) => ({ price: parseFloat(a[0]), quantity: parseFloat(a[1]) })),
        });
      } catch {}
    };
    depthWsRef.current = depthWs;
  };

  const cleanupWebSockets = () => {
    [tradeWsRef, klineWsRef, depthWsRef].forEach((ws) => ws.current?.close());
  };

  // ------------------------- EFFECTS -------------------------
  useEffect(() => {
    fetchHistoricalData();
    cleanupWebSockets();
    setupWebSockets();
  }, [timeframe]);

  useEffect(() => {
    if (price) setGolbalPrice(price);
  }, [price]);

  // ------------------------- PRICE CHANGE -------------------------
  const priceChange = (() => {
    if (candleData.length < 2) return { change: 0, percent: 0 };
    const current = candleData[candleData.length - 1]?.close || price || 0;
    const previous = candleData[candleData.length - 2]?.close || current;
    const change = current - previous;
    const percent = previous > 0 ? (change / previous) * 100 : 0;
    return { change, percent };
  })();

  // ------------------------- TIMEFRAMES -------------------------
  const timeframes = [
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "15m", label: "15m" },
    { value: "1h", label: "1h" },
    { value: "4h", label: "4h" },
    { value: "1d", label: "1D" },
  ];

  // ------------------------- RENDER -------------------------
  return (
    <div className="min-h-screen bg-[rgb(12,14,17)] text-white">
      <Header />
      <div className="container mx-auto p-2">
        {/* Chart Header */}
        <div className="bg-bg p-2 lg:p-3 rounded-sm md:rounded-md lg:rounded-lg mb-2 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center flex-1">
            <div className="grid grid-cols-2 md:flex gap-2 lg:gap-4 justify-between md:justify-start space-x-4 w-full">
              <div>
                <h1 className="text-lg lg:ext-xl font-bold">BTC/USDT</h1>
                <div className="text-xs lg:text-sm text-gray-400">{timeframe.toUpperCase()} · Binance</div>
              </div>
              <div>
                {price && (
                  <div
                    style={{
                      color: previousPrice !== null ? (price > previousPrice ? "#0ecb81" : "#f6465d") : "#0ecb81",
                    }}
                    className="text-lg lg:text-xl font-semibold text-end"
                  >
                    ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>
              <div className="text-sm w-full">
                <div className="flex space-x-4 w-full">
                  <span className="text-xs lg:text-sm">O {candleData.slice(-1)[0]?.open.toFixed(4) || "0.0000"}</span>
                  <span className="text-xs lg:text-sm">H {candleData.slice(-1)[0]?.high.toFixed(4) || "0.0000"}</span>
                  <span className="text-xs lg:text-sm">L {candleData.slice(-1)[0]?.low.toFixed(4) || "0.0000"}</span>
                  <span className="text-xs lg:text-sm">C {price?.toFixed(4) || "0.0000"}</span>
                </div>
                <div className={`font-semibold text-[10px] lg:text-xs ${priceChange.change >= 0 ? "text-green" : "text-red"}`}>
                  {priceChange.change >= 0 ? "+" : ""}
                  {priceChange.change.toFixed(4)} ({priceChange.percent >= 0 ? "+" : ""}{priceChange.percent.toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Timeframe Buttons */}
            <div className="flex items-center w-full justify-between md:justify-end space-x-2 mt-3 md:mt-0">
              <div className="flex bg-[#1f2328] rounded p-1">
                {timeframes.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`p-1 md:px-2 md:py-1 text-xs rounded ${timeframe === tf.value ? "bg-[#2b3139]" : "hover:bg-[#2b3139]"}`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex space-x-4 text-xs text-gray-400 mt-1 mb-2">
            <div>MA 25 close <span className="text-white">{indicators.ma25.toFixed(4)}</span></div>
            <div>MA 99 close <span className="text-white">{indicators.ma99.toFixed(4)}</span></div>
          </div>
        </div>

        {/* Chart + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Chart */}
          <div className="lg:col-span-3 h-fit rounded-lg">
            <div ref={chartContainerRef} className="border-2 border-[#1f2328] bg-[#0b0e11] w-full rounded-t-lg overflow-hidden" />
            <div ref={volumeChartContainerRef} className="w-full border-2 border-[#1f2328] bg-[#0b0e11] mt-1 rounded-b-lg overflow-hidden" />
            <div className="border-[#1f2328] border rounded-md overflow-hidden hidden md:block mt-2">
              <TradeHistory />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-2 lg:space-y-2">
            <TradePanel price={Number(price)} />
            {/* Order Book */}
            <div className="h-[440px] overflow-y-auto">
              <div className="bg-bg rounded-lg p-4 border border-[#1f2328] max-h-[500px] h-[500px]! overflow-hidden">
                <h3 className="text-base lg:text-lg font-semibold mb-2 lg:mb-4">Order Book</h3>
                <div className="space-y-1 text-xs">
                  {orderBook.asks.map((ask, i) => (
                    <div key={i} className="flex justify-between text-red">
                      <span>{ask.price.toFixed(2)}</span>
                      <span>{ask.quantity.toFixed(6)}</span>
                    </div>
                  ))}
                  <div className="text-center text-gray-400 my-2 border-t border-b border-[#1f2328] py-1">
                    Spread: {orderBook.bids.length && orderBook.asks.length ? (((orderBook.asks[0].price - orderBook.bids[0].price)/orderBook.bids[0].price)*100).toFixed(4) + "%" : "0%"}
                  </div>
                  {orderBook.bids.map((bid, i) => (
                    <div key={i} className="flex justify-between text-green">
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
  );
}
