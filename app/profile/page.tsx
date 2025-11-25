"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
  whiteList: Array<{
    id: string;
    networkIP: string;
    deviceName: string;
    userAgent?: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    description?: string;
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'balance' | 'devices'>('overview');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [balanceAction, setBalanceAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setProcessing(true);
    setMessage('');

    try {
      const endpoint = balanceAction === 'deposit' 
        ? '/api/transactions/deposit' 
        : '/api/transactions/withdraw';

      const body = balanceAction === 'deposit' 
        ? { amount: parseFloat(amount) }
        : { amount: parseFloat(amount), walletAddress };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`${balanceAction === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
        setAmount('');
        setWalletAddress('');
        fetchUserData(); // Refresh user data
      } else {
        setMessage(result.error || `Failed to process ${balanceAction}`);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile & Account</h1>
          <p className="text-gray-400">Manage your account settings and balance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('balance')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'balance' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Balance Management
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'devices' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Devices
                </button>
              </nav>
            </div>

            {/* Balance Card */}
            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
              <div className="text-2xl font-bold text-green-400">
                ${userData?.balance?.toFixed(2) || '0.00'}
              </div>
              <p className="text-sm text-gray-400 mt-1">Available for trading</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* User Information */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">User Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Username</label>
                      <p className="text-lg">{userData?.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <p className="text-lg">{userData?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Member Since</label>
                      <p className="text-lg">
                        {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Account Status</label>
                      <p className="text-lg text-green-400">Active</p>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                  {userData?.transactions && userData.transactions.length > 0 ? (
                    <div className="space-y-3">
                      {userData.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
                        >
                          <div>
                            <p className="font-medium capitalize">{transaction.type.toLowerCase()}</p>
                            <p className="text-sm text-gray-400">
                              {transaction.description} • {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={transaction.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}>
                              {transaction.type === 'DEPOSIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </p>
                            <p className={`text-xs capitalize ${
                              transaction.status === 'COMPLETED' ? 'text-green-400' :
                              transaction.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {transaction.status.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No transactions yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'balance' && (
              <div className="space-y-6">
                {/* Balance Actions */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Manage Balance</h2>
                  
                  {/* Action Toggle */}
                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={() => setBalanceAction('deposit')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        balanceAction === 'deposit'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => setBalanceAction('withdraw')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        balanceAction === 'withdraw'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Withdraw
                    </button>
                  </div>

                  {/* Action Form */}
                  <form onSubmit={handleBalanceAction} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Amount (USD)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>

                    {balanceAction === 'withdraw' && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Wallet Address
                        </label>
                        <input
                          type="text"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your wallet address"
                          required
                        />
                      </div>
                    )}

                    {message && (
                      <div className={`p-3 rounded-lg ${
                        message.includes('successful') 
                          ? 'bg-green-900/50 text-green-200' 
                          : 'bg-red-900/50 text-red-200'
                      }`}>
                        {message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      {processing ? 'Processing...' : 
                       balanceAction === 'deposit' ? 'Deposit Funds' : 'Request Withdrawal'}
                    </button>
                  </form>
                </div>

                {/* Transaction Limits */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Transaction Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-gray-400">Minimum Deposit</p>
                      <p className="text-white">$10.00</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-gray-400">Minimum Withdrawal</p>
                      <p className="text-white">$10.00</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-gray-400">Maximum Deposit</p>
                      <p className="text-white">$100,000.00</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-gray-400">Withdrawal Fee</p>
                      <p className="text-white">1% (min $1.00)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Whitelisted Devices</h2>
                <p className="text-gray-400 mb-4">
                  These are the devices that are authorized to access your account.
                </p>
                
                {userData?.whiteList && userData.whiteList.length > 0 ? (
                  <div className="space-y-3">
                    {userData.whiteList.map((device) => (
                      <div
                        key={device.id}
                        className="flex justify-between items-center p-4 bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{device.deviceName}</p>
                          <p className="text-sm text-gray-400">
                            IP: {device.networkIP} • Added: {new Date(device.createdAt).toLocaleDateString()}
                          </p>
                          {device.userAgent && (
                            <p className="text-xs text-gray-500 truncate max-w-md">
                              {device.userAgent}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-green-900 text-green-200 text-xs rounded">
                            Active
                          </span>
                          <button className="text-red-400 hover:text-red-300 text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No devices whitelisted.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}