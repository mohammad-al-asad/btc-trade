"use client"
// pages/trading.js
import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TradingPage() {
  const [price, setPrice] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = useState([]);
  const [timeframe, setTimeframe] = useState('1m');
  const [quantity, setQuantity] = useState('0.001');
  const [isConnected, setIsConnected] = useState(false);
  
  const tradeWsRef = useRef(null);
  const depthWsRef = useRef(null);

  // Fetch initial historical data
  useEffect(() => {
    fetchHistoricalData();
  }, [timeframe]);

  // WebSocket connections
  useEffect(() => {
    setupTradeWebSocket();
    setupDepthWebSocket();

    return () => {
      if (tradeWsRef.current) tradeWsRef.current.close();
      if (depthWsRef.current) depthWsRef.current.close();
    };
  }, []);

  const fetchHistoricalData = async () => {
    try {
      // Using Binance public API for historical data
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${timeframe}&limit=100`
      );
      const data = await response.json();
      
      const formattedData = data.map(candle => ({
        time: new Date(candle[0]).toLocaleTimeString(),
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));
      
      setPriceHistory(formattedData);
      if (formattedData.length > 0) {
        setPrice(formattedData[formattedData.length - 1].close);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const setupTradeWebSocket = () => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    
    ws.onopen = () => {
      console.log('Trade WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update latest price
        const latestPrice = parseFloat(data.p);
        setPrice(latestPrice);

        // Update recent trades
        setRecentTrades(prev => {
          const newTrades = [{
            id: data.t,
            price: latestPrice,
            quantity: parseFloat(data.q),
            time: new Date(data.T).toLocaleTimeString(),
            isBuyerMaker: data.m
          }, ...prev.slice(0, 9)];
          return newTrades;
        });

        // Update price history
        setPriceHistory(prev => {
          if (prev.length === 0) return prev;
          
          const newData = [...prev];
          const lastCandle = newData[newData.length - 1];
          
          // Update the last candle with new price
          newData[newData.length - 1] = {
            ...lastCandle,
            close: latestPrice,
            high: Math.max(lastCandle.high, latestPrice),
            low: Math.min(lastCandle.low, latestPrice)
          };
          
          return newData;
        });

      } catch (error) {
        console.error('Error processing trade data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Trade WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Trade WebSocket disconnected');
      setIsConnected(false);
      // Reconnect after 3 seconds
      setTimeout(() => {
        setupTradeWebSocket();
      }, 3000);
    };

    tradeWsRef.current = ws;
  };

  const setupDepthWebSocket = () => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms');
    
    ws.onopen = () => {
      console.log('Depth WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update order book
        setOrderBook({
          bids: data.bids.slice(0, 10).map(bid => ({
            price: parseFloat(bid[0]),
            quantity: parseFloat(bid[1])
          })),
          asks: data.asks.slice(0, 10).map(ask => ({
            price: parseFloat(ask[0]),
            quantity: parseFloat(ask[1])
          }))
        });
      } catch (error) {
        console.error('Error processing depth data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Depth WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Depth WebSocket disconnected');
      // Reconnect after 3 seconds
      setTimeout(() => {
        setupDepthWebSocket();
      }, 3000);
    };

    depthWsRef.current = ws;
  };

  const handleBuy = () => {
    if (!price || !quantity) return;
    const totalCost = price * parseFloat(quantity);
    alert(`Buy order placed: ${quantity} BTC at $${price.toFixed(2)} - Total: $${totalCost.toFixed(2)}`);
  };

  const handleSell = () => {
    if (!price || !quantity) return;
    const totalCost = price * parseFloat(quantity);
    alert(`Sell order placed: ${quantity} BTC at $${price.toFixed(2)} - Total: $${totalCost.toFixed(2)}`);
  };

  const timeframes = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1d' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Connection Status */}
      <div className={`p-2 text-center ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
        {isConnected ? 'Connected to Binance' : 'Disconnected - Reconnecting...'}
      </div>

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">BTC/USDT Trading</h1>
          <div className="text-2xl font-mono">
            {price ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Loading...'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chart Area - 3/4 width */}
          <div className="lg:col-span-3 bg-gray-800 rounded-lg p-4">
            {/* Chart Controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                {timeframes.map(tf => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-3 py-1 rounded ${
                      timeframe === tf.value ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-700 rounded">Indicator</button>
                <button className="px-3 py-1 bg-gray-700 rounded">Drawing</button>
              </div>
            </div>

            {/* Price Chart */}
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis stroke="#888" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="space-y-6">
            {/* Trading Panel */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Trade</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Quantity (BTC)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                    step="0.001"
                    min="0.001"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleBuy}
                    className="bg-green-600 hover:bg-green-700 rounded py-3 font-semibold transition-colors"
                  >
                    BUY
                  </button>
                  <button
                    onClick={handleSell}
                    className="bg-red-600 hover:bg-red-700 rounded py-3 font-semibold transition-colors"
                  >
                    SELL
                  </button>
                </div>
                
                <div className="text-sm text-gray-400 text-center">
                  Est. Cost: ${price ? (price * parseFloat(quantity)).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            {/* Order Book */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Order Book</h3>
              
              <div className="space-y-1 text-xs">
                {/* Asks */}
                {orderBook.asks.map((ask, index) => (
                  <div key={index} className="flex justify-between text-red-400">
                    <span>{ask.price.toFixed(2)}</span>
                    <span>{ask.quantity.toFixed(4)}</span>
                  </div>
                ))}
                
                {/* Spread */}
                <div className="text-center text-gray-400 my-2 border-t border-b border-gray-600 py-1">
                  Spread: {orderBook.bids.length > 0 && orderBook.asks.length > 0 
                    ? ((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.bids[0].price * 100).toFixed(4) + '%'
                    : '0%'
                  }
                </div>
                
                {/* Bids */}
                {orderBook.bids.map((bid, index) => (
                  <div key={index} className="flex justify-between text-green-400">
                    <span>{bid.price.toFixed(2)}</span>
                    <span>{bid.quantity.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
              
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {recentTrades.map((trade, index) => (
                  <div key={trade.id || index} className="flex justify-between text-sm">
                    <span className={trade.isBuyerMaker ? 'text-red-400' : 'text-green-400'}>
                      {trade.price.toFixed(2)}
                    </span>
                    <span className="text-gray-400">
                      {trade.quantity.toFixed(4)}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {trade.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Trading Info */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-sm">24h Change</div>
            <div className="text-green-400 text-lg">+2.5%</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-sm">24h High</div>
            <div className="text-white text-lg">$45,678</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-sm">24h Low</div>
            <div className="text-white text-lg">$43,210</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-sm">24h Volume</div>
            <div className="text-white text-lg">25.5K BTC</div>
          </div>
        </div>
      </div>
    </div>
  );
}