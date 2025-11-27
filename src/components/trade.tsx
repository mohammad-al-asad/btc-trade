/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserAssets } from "../lib/queries";
import { AiFillPlusCircle } from "react-icons/ai";
import { useCurrentUser } from "../lib/hook";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSnackbar } from "notistack";
const TradePanel = ({ price }: { price: number }) => {
  const [quantity, setQuantity] = useState<any>(1);

  const { data } = useQuery({
    queryKey: ["btc-price"],
    queryFn: getUserAssets,
    refetchInterval: 1000,
  });

  const user = useCurrentUser();
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const trade = async (tradeType: string) => {
    if (!user) {
      router.push("/auth/signin");
    }
    const response = await fetch("/api/trade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: quantity,
        token: "BTC",
        tradeAction: tradeType,
        price: price,
      }),
    });
    const data = await response.json();
    if (data?.error) {
      enqueueSnackbar(data.error, { variant: "error" });
    }
    if (data?.payload) {
      enqueueSnackbar("Order Created", { variant: "success" });
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Trade</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Quantity (USDT)
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm"
            step="0.001"
            min="0.001"
          />
        </div>
        {user && data && (
          <AssetLabels
            usdt={data.payload.usdt.amount}
            btc={(+data.payload.btc.amount).toFixed(20)}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => trade("BUY")}
            className="bg-green-600 cursor-pointer hover:bg-green-700 rounded py-2 font-semibold transition-colors text-sm"
          >
            BUY
          </button>
          <button
            onClick={() => trade("SELL")}
            className="bg-red-600 cursor-pointer hover:bg-red-700 rounded py-2 font-semibold transition-colors text-sm"
          >
            SELL
          </button>
        </div>

        <div className="text-sm text-gray-400 text-center">
          Est. BTC: ₿{(quantity / price).toFixed(20)}
        </div>
      </div>
    </div>
  );
};

export default TradePanel;

const AssetLabels = ({ usdt, btc }: { usdt: number; btc: string }) => {
  return (
    <div className="space-y-1.5 sticky bottom-0">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300">Avbl (USDT)</span>
        {/* <span>{data.payload.usdt}</span> */}
        <span className="text-xs text-white font-medium flex gap-1">
          ${usdt}
          <Link href="/deposit">
            <AiFillPlusCircle className="text-green-500" />
          </Link>
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300">Avbl (BTC)</span>
        <span className="text-xs text-white font-medium">₿{btc}</span>
        {/* <span>{data.payload.btc}</span> */}
      </div>
    </div>
  );
};
