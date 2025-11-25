"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiBtcFill } from "react-icons/ri";
import { BiMoneyWithdraw } from "react-icons/bi";
import { RiLuggageDepositLine } from "react-icons/ri";

interface UserData {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
  assets: Array<{
    id: string;
    assetName: string;
    amount: number;
    currentPrice?: number;
    value?: number;
  }>;
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactionData, setTransactionData] = useState<any[]>();
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"assets" | "activity">("assets");
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "BTC">(
    "USD"
  );

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
      fetchBtcData();
      fetchTransactionData();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBtcData = async () => {
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
      );

      if (response.ok) {
        const data = await response.json();
        setBtcPrice(data.price);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionData = async () => {
    try {
      const response = await fetch("api/transactions");

      if (response.ok) {
        const data = await response.json();
        setTransactionData(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total portfolio value in selected currency
  const calculateTotalPortfolioValue = () => {
    if (!userData?.assets) return 0;
    const total =
      selectedCurrency == "BTC"
        ? userData?.assets[0].amount
        : userData?.assets[1].amount;
    return total;
  };

  const totalPortfolioValue = calculateTotalPortfolioValue();

  // Format value based on selected currency
  const formatValue = (value: number) => {
    if (selectedCurrency === "BTC") {
      return `₿ ${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$ ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* User Info Card */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-right ml-auto">
              <p className="text-gray-400 text-sm">Member since</p>
              <p className="text-sm">
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Balance Section */}
          <div className="text-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">@{userData?.username}</h2>
            </div>
            <p className="text-gray-400 text-sm mb-2">Total Balance</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-4xl font-bold">
                {formatValue(totalPortfolioValue)}
              </div>
              <select
                value={selectedCurrency}
                onChange={(e) =>
                  setSelectedCurrency(e.target.value as "USD" | "BTC")
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="BTC">BTC</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-center">
            <Link
              href="/deposit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors flex gap-1 items-center"
            >
              <RiLuggageDepositLine size={20} />
              Deposit
            </Link>
            <Link
              href="/withdraw"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors flex gap-1 items-center"
            >
              <BiMoneyWithdraw size={20} />
              Withdraw
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("assets")}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "assets"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            My Assets
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "activity"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Recent Activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "assets" && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">My Assets</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Asset
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Value
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    key={userData?.assets[0].id}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <RiBtcFill className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center mr-3" />

                        <div>
                          <p className="font-medium">
                            {userData?.assets[0].assetName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold">{btcPrice}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold bg-amber-600 w-fit px-2 rounded-sm mb-0.5">
                        ₿ {userData?.assets[0].amount}
                      </p>
                      {userData?.assets[0].amount ? (
                        <p className="font-semibold bg-green-600 w-fit px-2.5 rounded-sm">
                          $ {userData?.assets[0].amount * btcPrice!}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {/* {transactionData?.map((transaction:any) => (
                
              ))} */}

              {/* Sample activity items - replace with real data */}
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Deposit</p>
                    <p className="text-sm text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">+$1,000.00</p>
                  <p className="text-sm text-gray-400">Completed</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Withdraw</p>
                    <p className="text-sm text-gray-400">1 day ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-semibold">-$500.00</p>
                  <p className="text-sm text-gray-400">Completed</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Trade</p>
                    <p className="text-sm text-gray-400">3 days ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-semibold">BTC Purchase</p>
                  <p className="text-sm text-gray-400">Completed</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
