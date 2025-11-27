/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiLuggageDepositLine } from "react-icons/ri";
import { BiMoneyWithdraw } from "react-icons/bi";
import { IoLogOut } from "react-icons/io5";
import profile from "@/public/profile.png";

interface AssetItem {
  id: string;
  amount: number | string;
  assetName: "USDT" | "BTC";
  currentPrice?: number;
  value?: number;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  balance?: number;
  createdAt?: string;
  assets: AssetItem[];
}

interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRADE" | "FEE";
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED";
  description?: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"assets" | "activity">("assets");
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "BTC">(
    "USD"
  );

  // NOTE: If you use external avatars (https://avatar.iran.liara.run),
  // add the domain in next.config.js:
  // images: { domains: ['avatar.iran.liara.run'] }

  useEffect(() => {
    if (status === "authenticated") {
      // fetch all needed data together, then stop loading
      const loadAll = async () => {
        setLoading(true);
        await Promise.all([
          fetchUserData(),
          fetchBtcData(),
          fetchTransactionData(),
        ]);
        setLoading(false);
      };
      loadAll();

      // poll transactions periodically (every 20s)
      const iv = setInterval(() => {
        fetchTransactionData();
      }, 20_000);
      return () => clearInterval(iv);
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    // we intentionally do not include router in deps to avoid frequent redirects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Fetch user
  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      if (!res.ok) return;
      const data = await res.json();
      // ensure assets amounts are numbers (Prisma Decimal may be string)
      if (data?.assets && Array.isArray(data.assets)) {
        data.assets = data.assets.map((a: any) => ({
          ...a,
          amount: typeof a.amount === "string" ? Number(a.amount) : a.amount,
        }));
      }
      setUserData(data);
    } catch (err) {
      console.error("fetchUserData:", err);
    }
  };

  // Fetch BTC price
  const fetchBtcData = async () => {
    try {
      // Get current BTC price from Binance
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/btc-modify`
      );
      const btcResponse = await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
      );
      if (!btcResponse.ok && !res.ok) return null;

      const { modifyData } = await res.json();
      const btcData = await btcResponse.json();

      const price = parseFloat(btcData.price);
      const btcModifyFloat = parseFloat(modifyData.adjustment);
      let currentBtcPrice: number;
      if (btcModifyFloat < 0) {
        currentBtcPrice = price - Math.abs(btcModifyFloat);
      } else {
        currentBtcPrice = btcModifyFloat + price;
      }
      setBtcPrice(currentBtcPrice);
    } catch (error) {
      console.error("fetchBtcData:", error);
    }
  };

  // Fetch transactions for logged-in user
  const fetchTransactionData = async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) {
        console.error("failed to fetch transactions", res.status);
        return;
      }
      const json = await res.json();
      setTransactionData(json.transactions ?? []);
    } catch (error) {
      console.error("fetchTransactionData:", error);
    }
  };

  // Calculate total portfolio value based on selected currency
  const calculateTotalPortfolioValue = () => {
    if (!userData?.assets || userData.assets.length === 0) return 0;

    // Ensure numbers
    const assets = userData.assets.map((a) => ({
      ...a,
      amount: Number(a.amount),
    }));

    // USD total: BTC in USD (btc amount * btcPrice) + USDT amount
    const usdTotal =
      assets.reduce((sum, a) => {
        if (a.assetName === "BTC") return sum + a.amount * (btcPrice || 0);
        if (a.assetName === "USDT") return sum + a.amount;
        return sum;
      }, 0) ?? 0;

    // BTC total: BTC amount + (USDT / btcPrice)
    const btcTotal =
      assets.reduce((sum, a) => {
        if (a.assetName === "BTC") return sum + a.amount;
        if (a.assetName === "USDT")
          return sum + (btcPrice ? a.amount / btcPrice : 0);
        return sum;
      }, 0) ?? 0;

    return selectedCurrency === "BTC" ? btcTotal : usdTotal;
  };

  const totalPortfolioValue = calculateTotalPortfolioValue();

  const formatValue = (value: number) => {
    if (selectedCurrency === "BTC") {
      return `₿ ${value.toLocaleString(undefined, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      })}`;
    }
    return `$ ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-black via-[#0d0d0d] to-black flex items-center justify-center px-4">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-linear-to-b from-black via-[#0d0d0d] to-black text-white">
      {/* decorative background image */}
      <div className="absolute top-0 left-0 opacity-20 pointer-events-none">
        <Image
          src="/grow.png"
          alt="grow"
          width={360}
          height={360}
          className="select-none"
        />
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        {/* User Card */}
        <div className="bg-[#0f1113]/60 backdrop-blur-md border border-[#222] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <Image src={profile} alt="avatar" width={64} height={64} />
              </div>

              <div>
                <p className="text-sm text-[#9aa3b2]">{userData?.email}</p>
                <p className="text-2xl font-bold">{userData?.username}</p>
              </div>
            </div>

            <div>
              <button
                title="Sign out"
                onClick={() => signOut()}
                className="bg-gray-700 border-[2.5px] border-red-400 p-3 rounded-full"
              >
                <IoLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="mt-6 bg-[#111]/50 border border-[#222] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[#9aa3b2] text-sm">Current Balance</p>
              <h2 className="text-3xl font-bold mt-1">
                {formatValue(totalPortfolioValue)}
              </h2>
            </div>

            <div>
              <select
                value={selectedCurrency}
                onChange={(e) =>
                  setSelectedCurrency(e.target.value as "USD" | "BTC")
                }
                className="bg-[#0f1113] border border-[#2b2b2b] rounded-md px-3 py-1 text-sm"
              >
                <option value="USD">USD</option>
                <option value="BTC">BTC</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-6 justify-center">
            <Link href="/deposit" className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#0f1113] border border-[#2b2b2b] flex items-center justify-center">
                <RiLuggageDepositLine className="w-6 h-6" />
              </div>
              <p className="text-sm mt-1">Deposit</p>
            </Link>

            <Link href="/withdraw" className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#0f1113] border border-[#2b2b2b] flex items-center justify-center">
                <BiMoneyWithdraw className="w-6 h-6" />
              </div>
              <p className="text-sm mt-1">Withdraw</p>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-4">
          <button
            onClick={() => setActiveTab("assets")}
            className={`pb-2 text-lg ${
              activeTab === "assets"
                ? "text-white border-b-2 border-white"
                : "text-gray-400"
            }`}
          >
            My Assets
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-2 text-lg ${
              activeTab === "activity"
                ? "text-white border-b-2 border-white"
                : "text-gray-400"
            }`}
          >
            Recent Activity
          </button>
        </div>

        {/* Content */}
        {activeTab === "assets" && (
          <div className="bg-[#0f1113]/60 border border-[#222] rounded-xl space-y-3">
            <div className=" rounded-2xl p-2">
              {" "}
              <div className="overflow-x-auto">
                {" "}
                <div className="w-full bg-[#111] border border-[#232323] rounded-lg flex items-center justify-between py-4 px-4">
                  {" "}
                  {/* Left Asset Part */}{" "}
                  <div className="flex items-center">
                    {" "}
                    <Image
                      src="/bitcoin.png"
                      alt="bitcoin"
                      width={40}
                      height={40}
                    />
                    <div className="ml-2">
                      {" "}
                      <p className="text-xl font-semibold">BitCoin</p>{" "}
                      <p className="text-sm">${btcPrice}</p>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Right Value / Balance Part */}{" "}
                  <div className="text-right">
                    {" "}
                    <p className="font-semibold px-2 rounded-sm mb-0.5">
                      {" "}
                      ₿{" "}
                      {Number(
                        userData?.assets!.find(
                          (userAsset) => userAsset.assetName == "BTC"
                        )?.amount
                      ).toFixed(20)}{" "}
                    </p>{" "}
                    <p className="px-2.5 rounded-sm text-green-600">
                      {" "}
                      ${" "}
                      {Number(
                        userData?.assets!.find(
                          (userAsset) => userAsset.assetName == "BTC"
                        )?.amount
                      ) * btcPrice}{" "}
                    </p>
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-[#0f1113]/60 border border-[#222] rounded-xl p-4 space-y-3 h-[600px] overflow-auto">
            {transactionData.length === 0 ? (
              <p className="text-center text-gray-400 py-6">
                No recent transactions found.
              </p>
            ) : (
              transactionData.map((tx) => {
                const isDeposit = tx.type === "DEPOSIT";
                const colorClass =
                  tx.status === "COMPLETED"
                    ? "text-green-400"
                    : tx.status === "REJECTED"
                    ? "text-red-400"
                    : "text-yellow-400";

                return (
                  <div
                    key={tx.id}
                    className="flex gap-3 p-4 bg-[#111] border border-[#232323] rounded-lg"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-[#0f1113] rounded-full border border-[#2b2b2b]">
                      <Image
                        src={isDeposit ? "/deposit.png" : "/withdraw.png"}
                        alt={isDeposit ? "Deposit" : "Withdraw"}
                        width={28}
                        height={28}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-semibold">
                            {isDeposit ? "Deposit" : "Withdrawal"}{" "}
                            <span className="text-sm text-gray-400">
                              • {tx.status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-400">
                            {tx.description ?? "No description"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              isDeposit ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {isDeposit ? "+" : "-"} {tx.amount} {tx.currency}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className={`text-xs font-medium ${colorClass}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
