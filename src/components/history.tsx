/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { MdOutlineManageHistory } from "react-icons/md";
import { useCurrentUser } from "../lib/hook";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getClosedTradeHistory, getTradeHistory } from "../lib/queries";
import { ClosedOrdersList, OpenOrdersList } from "./history-list";
import { LuSearchX } from "react-icons/lu";
import DataLoading from "./data-loading";
import { useSession } from "next-auth/react";

interface Order {
  id: string;
  tradeAmount: number;
  profit: number;
  loss: number;
  growth: string;
  leverage: number;
  entryUsdt: number;
  status: "RUNNING" | "CANCELED" | "ENDED";
}

const TradingHistory = () => {
  const { status } = useSession();
  const user = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"open" | "history">("open");
  const { data, error, isLoading } = useQuery({
    queryKey: ["trade-history"],
    queryFn: getTradeHistory,
    enabled: status == "authenticated",
    refetchInterval: 1000,
  });

  const {
    data: closedHistory,
    error: error2,
    isLoading: isLoading2,
  } = useQuery({
    queryKey: ["closed-trade-history"],
    queryFn: getClosedTradeHistory,
    enabled: status == "authenticated",
  });

  // Mock data for order history
  const orderHistory: Order[] = [
    {
      id: "3",
      tradeAmount: 1.2,
      profit: 320.75,
      loss: -120.5,
      growth: "+3.1%",
      leverage: 15,
      entryUsdt: 5000,
      status: "ENDED",
    },
    {
      id: "4",
      tradeAmount: 0.8,
      profit: 0,
      loss: -200.0,
      growth: "-1.8%",
      leverage: 8,
      entryUsdt: 3200,
      status: "CANCELED",
    },
  ];

  const getOpenTrades = () => {
    const trades = data?.payload?.trades?.filter(
      (trade: any) => trade.status == "RUNNING"
    );
    return trades;
  };

  const openTrades = getOpenTrades();
  const closedTradeHistory = closedHistory?.payload.trades;

  return (
    <div className=" bg-bg text-white p-2 md:p-3">
      {/* Navigation */}
      <nav className="flex space-x-5 md:space-x-6  border-b border-b-[rgb(53,59,70)]">
        <button
          className={`pb-1.5 md:pb-2 px-1 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === "open"
              ? "border-main text-main"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("open")}
        >
          Open Orders {openTrades ? `(${openTrades?.length})` : null}
        </button>
        <button
          className={`pb-1.5 md:pb-2 px-1 border-b-2 font-semibold text-sm transition-colors ${
            activeTab === "history"
              ? "border-main text-main"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("history")}
        >
          Order History{" "}
          {closedTradeHistory ? `(${closedTradeHistory?.length})` : null}
        </button>
      </nav>

      {/* Content */}
      <div className=" p-3 md:p-5 md:max-h-[150px] md:h-[150px] overflow-y-auto">
        {!user && (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex gap-1 items-center ">
              <Link className=" text-main font-medium" href={"/auth/signin"}>
                Signin
              </Link>
              Or
              <Link className=" text-main font-medium" href={"/auth/signup"}>
                Signup
              </Link>
              to Trade
            </div>
          </div>
        )}
        {orderHistory.length == 0 && user && (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex gap-1 items-center text-main">
              <MdOutlineManageHistory /> No Trade History Found
            </div>
          </div>
        )}

        {user && (error || error2) && (
          <div className="flex items-center justify-center h-full text-red-600 gap-1">
            <LuSearchX /> Fetch Failed
          </div>
        )}

        {!data && (isLoading || isLoading2) && user && (
          <div className="h-full flex items-center justify-center">
            <DataLoading />
          </div>
        )}

        {user && (
          <>
            {activeTab == "open" && (
              <div>
                {data && openTrades.length == 0 && (
                  <div className="text-center h-full flex items-center justify-center">
                    No Opne Trades
                  </div>
                )}
                {data && openTrades.length !== 0 && (
                  <OpenOrdersList data={data.payload.trades} />
                )}
              </div>
            )}
            {activeTab == "history" && (
              <div>
                {closedHistory && closedTradeHistory.length == 0 && (
                  <div className="text-center h-full flex items-center justify-center">
                    No Trades Histories
                  </div>
                )}
                {closedHistory && closedTradeHistory.length !== 0 && (
                  <ClosedOrdersList data={closedTradeHistory} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TradingHistory;
