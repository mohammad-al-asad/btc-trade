import { useState } from 'react';

interface Order {
  id: string;
  tradeAmount: number;
  profit: number;
  loss: number;
  growth: string;
  leverage: number;
  entryUsdt: number;
  status: 'RUNNING' | 'CANCELED' | 'ENDED';
}

const TradingOrders = () => {
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');

  // Mock data for open orders
  const openOrders: Order[] = [
    {
      id: '1',
      tradeAmount: 0.5,
      profit: 150.25,
      loss: -50.75,
      growth: '+2.5%',
      leverage: 10,
      entryUsdt: 2500,
      status: 'RUNNING'
    },
    {
      id: '2',
      tradeAmount: 0.3,
      profit: 75.50,
      loss: -25.25,
      growth: '+1.2%',
      leverage: 5,
      entryUsdt: 1800,
      status: 'RUNNING'
    }
  ];

  // Mock data for order history
  const orderHistory: Order[] = [
    {
      id: '3',
      tradeAmount: 1.2,
      profit: 320.75,
      loss: -120.50,
      growth: '+3.1%',
      leverage: 15,
      entryUsdt: 5000,
      status: 'ENDED'
    },
    {
      id: '4',
      tradeAmount: 0.8,
      profit: 0,
      loss: -200.00,
      growth: '-1.8%',
      leverage: 8,
      entryUsdt: 3200,
      status: 'CANCELED'
    }
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'RUNNING':
        return 'text-green-500';
      case 'ENDED':
        return 'text-blue-500';
      case 'CANCELED':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getProfitLossColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Trading Platform</h1>
        <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors">
          Log in or Register Now to trade
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex space-x-8 mb-6 border-b border-gray-700">
        <button
          className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'open'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('open')}
        >
          Open Orders ({openOrders.length})
        </button>
        <button
          className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Order History
        </button>
        <button className="pb-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-300 font-medium text-sm transition-colors">
          Trade History
        </button>
        <button className="pb-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-300 font-medium text-sm transition-colors">
          Funds
        </button>
        <button className="pb-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-300 font-medium text-sm transition-colors">
          Bots
        </button>
      </nav>

      {/* Content */}
      <div className="bg-gray-800 rounded-lg p-6">
        {activeTab === 'open' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Open Orders</h2>
            {openOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No open orders
              </div>
            ) : (
              <div className="space-y-4">
                {openOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-700 rounded-lg p-4 grid grid-cols-2 md:grid-cols-7 gap-4 items-center"
                  >
                    <div>
                      <div className="text-sm text-gray-400">Trade Amount</div>
                      <div className="font-medium">{order.tradeAmount} BTC</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Profit</div>
                      <div className={`font-medium ${getProfitLossColor(order.profit)}`}>
                        ${order.profit.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Loss</div>
                      <div className={`font-medium ${getProfitLossColor(order.loss)}`}>
                        ${order.loss.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Growth</div>
                      <div className={`font-medium ${order.growth.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {order.growth}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Leverage</div>
                      <div className="font-medium">{order.leverage}x</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Status</div>
                      <div className={`font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <div className="text-sm text-gray-400 mb-1">Entry USDT</div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">${order.entryUsdt}</span>
                        <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Order History</h2>
            {orderHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No order history
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-700 rounded-lg p-4 grid grid-cols-2 md:grid-cols-7 gap-4 items-center"
                  >
                    <div>
                      <div className="text-sm text-gray-400">Trade Amount</div>
                      <div className="font-medium">{order.tradeAmount} BTC</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Profit</div>
                      <div className={`font-medium ${getProfitLossColor(order.profit)}`}>
                        ${order.profit.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Loss</div>
                      <div className={`font-medium ${getProfitLossColor(order.loss)}`}>
                        ${order.loss.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">P/L Status</div>
                      <div className={`font-medium ${getProfitLossColor(order.profit + order.loss)}`}>
                        ${(order.profit + order.loss).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Trade Status</div>
                      <div className={`font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Leverage</div>
                      <div className="font-medium">{order.leverage}x</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Entry USDT</div>
                      <div className="font-medium">${order.entryUsdt}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingOrders;