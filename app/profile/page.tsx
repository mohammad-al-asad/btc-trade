"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiBtcFill } from "react-icons/ri";
import { BiMoneyWithdraw } from "react-icons/bi";
import { RiLuggageDepositLine } from "react-icons/ri";
import { IoLogOut } from "react-icons/io5";
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
        console.log({data})
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
      <div className=" min-h-screen bg-gray-900 flex items-center justify-center px-2 lg:px-[400px]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#080808] text-white">
      <div
        className="
      top-0 left-0 absolute"
      >
        <img src="grow.png" alt="" className="select-none w-[380px]" />
      </div>

      <div className="container mx-auto  max-w-4xl relative">
        {/* User Info Card */}
        <div className=" rounded-2xl py-6 mb-6 bg-transparent backdrop-blur-2xl">
          {/* <div className="flex items-center justify-between mb-6">
            <div className="text-right ml-auto">
              <p className="text-gray-400 text-sm">Member since</p>
              <p className="text-sm">
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div> */}

          <div className="py-5 md:py-7 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 lg:gap-6">
              <img
                src="https://avatar.iran.liara.run/public/boy?username=Ash"
                alt=""
                className="w-[70px] lg:w-[80px] rounded-full"
              />
              <div>
                <span className="text-sm lg:text-base text-[#788094]">
                  {userData?.email}
                </span>
                <br />
                <span className="text-2xl lg:text-3xl text-white font-bold">
                  {userData?.username}
                </span>
              </div>
            </div>
            <div>
              <button className="bg-[rgb(25,25,25)] border cursor-pointer border-[rgb(39,39,39)] p-4 lg:p-6 rounded-full">
                <IoLogOut className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          {/* Balance Section */}
          <div className=" w-[90%] my-3 mx-auto rounded-2xl  p-5 py-8 lg:p-4 mb-6 bg-[rgba(25,25,25,0.45)] border cursor-pointer border-[rgb(39,39,39)] backdrop-blur-3xl text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#788094] text-2xl  font-medium">
                  Current Balance
                </span>
                <h2 className="text-4xl text-white ">
                  {formatValue(totalPortfolioValue)}
                </h2>
              </div>
              <div>
                <select
                  value={selectedCurrency}
                  onChange={(e) =>
                    setSelectedCurrency(e.target.value as "USD" | "BTC")
                  }
                  className="bg-[rgba(25,25,25,0.24)] border border-[rgb(39,39,39)] rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-center">
            <Link href="/deposit" className="flex flex-col text-center">
              <div className="bg-[rgb(25,25,25)] border cursor-pointer border-[rgb(39,39,39)] text-white font-semibold flex justify-center items-center rounded-full transition-colors  w-20 h-20">
                <RiLuggageDepositLine className="w-7  h-7" />
              </div>
              <span className="text-base text-white">Deposit</span>
            </Link>
            <Link href="/withdraw" className="flex flex-col text-center">
              <div className="bg-[rgb(25,25,25)] border cursor-pointer border-[rgb(39,39,39)] w-20 h-20 font-semibold  rounded-full transition-colors flex justify-center items-center ">
                <BiMoneyWithdraw className="w-7  h-7" />
              </div>
              <span className="text-base text-white">Withdraw</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 ">
          <button
            onClick={() => setActiveTab("assets")}
            className={`px-6 py-3 text-lg font-semibold rounded-xl transition-colors ${
              activeTab === "assets" ? " text-white" : " text-gray-300 "
            }`}
          >
            My Assets
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-3 text-lg font-semibold  rounded-xl font-medium transition-colors ${
              activeTab === "activity" ? " text-white" : " text-gray-300 "
            }`}
          >
            Recent Activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "assets" && (
          <div className=" rounded-2xl p-6">
            <div className="overflow-x-auto">
              <div className="w-full bg-[rgb(25,25,25)] border border-[rgb(36,36,36)] rounded-2xl flex items-center justify-between py-4 px-4">
                {/* Left Asset Part */}
                <div className="flex items-center">
                  <img
                    src="./bitcoin.png"
                    alt="bitcoin"
                    className="select-none"
                  />

                  <div className="ml-2">
                    <p className="text-xl font-semibold">BitCoin</p>
                    <p className="text-sm">${btcPrice}</p>
                  </div>
                </div>

                {/* Right Value / Balance Part */}
                <div className="text-right">
                  <p className="font-semibold px-2 rounded-sm mb-0.5">
                    ₿ {Number(userData?.assets[0].amount).toFixed(10)}
                  </p>

                  {userData?.assets[0].amount ? (
                    <p className="px-2.5 rounded-sm text-green-600">
                      $ {userData?.assets[0].amount * btcPrice}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className=" rounded-2xl p-6">
            <div className="space-y-3">
              {/* {transactionData?.map((transaction:any) => (
                
              ))} */}
              <div className="w-full bg-[rgb(25,25,25)] border border-[rgb(36,36,36)] rounded-2xl flex items-center  py-4 px-4">
                {/* Left Asset Part */}
                <div className="flex items-center">
                  <img
                    src="./withdraw.png"
                    alt="bitcoin"
                    className="select-none"
                  />
                </div>

                <div className="ml-3">
                  <p className="text-xl font-semibold">Withdraw Successfull</p>
                  <p className="text-sm text-[#788094]">
                    You have withdraw $8000 to your account
                  </p>
                </div>
              </div>

              <div className="w-full bg-[rgb(25,25,25)] border border-[rgb(36,36,36)] rounded-2xl flex items-center  py-4 px-4">
                {/* Left Asset Part */}
                <div className="flex items-center">
                  <img
                    src="./deposit.png"
                    alt="bitcoin"
                    className="select-none"
                  />
                </div>

                <div className="ml-3">
                  <p className="text-xl font-semibold">Deposit Successfull</p>
                  <p className="text-sm text-[#788094]">
                    You have deposited $8000 to your account
                  </p>
                </div>
              </div>

              {/* Sample activity items - replace with real data */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
