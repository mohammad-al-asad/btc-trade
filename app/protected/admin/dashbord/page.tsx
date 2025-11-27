"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface PriceAdjustment {
  id: string;
  symbol: string;
  previousPrice: number;
  newPrice: number;
  adjustment: number;
  createdAt: string;
  admin: {
    username: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"transactions" | "price">(
    "transactions"
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [priceAdjustments, setPriceAdjustments] = useState<PriceAdjustment[]>(
    []
  );
  const [currentBtcPrice, setCurrentBtcPrice] = useState<number>(0);
  const [priceAdjustment, setPriceAdjustment] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      checkAdminAccess();
    }
  }, [status, router]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/admin/transactions?limit=5");
      if (response.status === 401) {
        router.push("/");
        return;
      }
      if (response.ok) {
        fetchTransactions();
        fetchBtcPrice();
      }
    } catch (error) {
      console.error("Admin access check failed:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        "/api/admin/transactions?status=PENDING&limit=50"
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setStats(data.counts);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchBtcPrice = async () => {
    try {
      const response = await fetch("/api/admin/btc-price");
      if (response.ok) {
        const data = await response.json();
        setCurrentBtcPrice(data.currentPrice);
        setPriceAdjustments(data.adjustments);
      }
    } catch (error) {
      console.error("Error fetching BTC price:", error);
    }
  };

  const handleApprove = async (transactionId: string) => {
    setProcessing(transactionId);
    try {
      const response = await fetch(
        `/api/admin/transactions/${transactionId}/approve`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
        fetchTransactions(); // Refresh stats
      } else {
        alert("Failed to approve transaction");
      }
    } catch (error) {
      console.error("Error approving transaction:", error);
      alert("Error approving transaction");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transactionId: string) => {
    setProcessing(transactionId);
    try {
      const response = await fetch(
        `/api/admin/transactions/${transactionId}/reject`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
        fetchTransactions(); // Refresh stats
      } else {
        alert("Failed to reject transaction");
      }
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      alert("Error rejecting transaction");
    } finally {
      setProcessing(null);
    }
  };

  const handlePriceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceAdjustment) return;

    setProcessing("price");
    try {
      const response = await fetch("/api/admin/btc-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adjustment: parseFloat(priceAdjustment),
        }),
      });

      if (response.ok) {
        setPriceAdjustment("");
        fetchBtcPrice();
        alert("BTC price adjusted successfully");
      } else {
        alert("Failed to adjust BTC price");
      }
    } catch (error) {
      console.error("Error adjusting BTC price:", error);
      alert("Error adjusting BTC price");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-black via-[#0d0d0d] to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-[#0d0d0d] to-black text-white pt-10">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-[#9aa3b2]">
            Manage transactions and system settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[#9aa3b2]">
              Pending Transactions
            </h3>
            <p className="text-3xl font-bold text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[#9aa3b2]">
              Pending Deposits
            </h3>
            <p className="text-3xl font-bold text-blue-400">
              {stats.pendingDeposits}
            </p>
          </div>
          <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[#9aa3b2]">
              Pending Withdrawals
            </h3>
            <p className="text-3xl font-bold text-red-400">
              {stats.pendingWithdrawals}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "transactions"
                ? "bg-blue-600 text-white"
                : "bg-[#0f1113]/60 border border-[#222] text-[#9aa3b2] hover:bg-[#1a1d21]"
            }`}
          >
            Pending Transactions
          </button>
          <button
            onClick={() => setActiveTab("price")}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "price"
                ? "bg-blue-600 text-white"
                : "bg-[#0f1113]/60 border border-[#222] text-[#9aa3b2] hover:bg-[#1a1d21]"
            }`}
          >
            BTC Price Management
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "transactions" && (
          <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">Pending Transactions</h2>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#222]">
                      <th className="text-left py-3 px-4 text-[#9aa3b2] font-medium">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-[#9aa3b2] font-medium">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-[#9aa3b2] font-medium">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-[#9aa3b2] font-medium">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 text-[#9aa3b2] font-medium">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-[#9aa3b2] font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-[#222] hover:bg-[#1a1d21]/50"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">
                              {transaction.user.username}
                            </p>
                            <p className="text-sm text-[#9aa3b2]">
                              {transaction.user.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === "DEPOSIT"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold">
                            {transaction.type == "DEPOSIT" ? "₿" : "$"}
                            {transaction.amount.toFixed(2)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-[#9aa3b2]">
                            {transaction.description}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-[#9aa3b2]">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(transaction.id)}
                              disabled={processing === transaction.id}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              {processing === transaction.id
                                ? "Processing..."
                                : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(transaction.id)}
                              disabled={processing === transaction.id}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#9aa3b2]">No pending transactions</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "price" && (
          <div className="space-y-6">
            {/* Current Price Card */}
            <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4">Current BTC Price</h2>
              <div className="text-3xl font-bold text-green-400">
                $
                {currentBtcPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            {/* Price Adjustment Form */}
            <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4">Adjust BTC Price</h2>
              <form onSubmit={handlePriceAdjustment} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#9aa3b2] mb-2">
                    Adjustment Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={priceAdjustment}
                    onChange={(e) => setPriceAdjustment(e.target.value)}
                    className="w-full bg-[#111] border border-[#232323] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount to add/subtract"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-[#9aa3b2] mt-1">
                    Positive number increases price, negative decreases
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={processing === "price"}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  {processing === "price" ? "Processing..." : "Adjust Price"}
                </button>
              </form>
            </div>

            {/* Recent Adjustments */}
            <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4">
                Recent Price Adjustments
              </h2>
              {priceAdjustments.length > 0 ? (
                <div className="space-y-3">
                  {priceAdjustments.map((adjustment) => (
                    <div
                      key={adjustment.id}
                      className="flex items-center justify-between p-3 bg-[#1a1d21] rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{adjustment.symbol}</p>
                        <p className="text-sm text-[#9aa3b2]">
                          {new Date(adjustment.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-[#6b7280]">
                          By: {session?.user?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            adjustment.adjustment >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {adjustment.adjustment >= 0 ? "+" : ""}
                          {adjustment.adjustment.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#9aa3b2] text-center py-4">
                  No price adjustments yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
