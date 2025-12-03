"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserAssets } from "../lib/queries";
import { AiFillPlusCircle } from "react-icons/ai";
import { useCurrentUser } from "../lib/hook";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSnackbar } from "notistack";
import { usePrice } from "../lib/store";
const Spot = () => {
  const { price } = usePrice((state) => state);
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
        amount: quantity * price,
        token: "BTC",
        tradeAction: tradeType,
        price,
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
    <div className="space-y-3 p-1.5 lg:p-3">
      <label className="block text-sm text-gray-400 mb-1">Quantity (BTC)</label>
      <div className="relative flex justify-between items-center border-[rgb(69,76,89)] border rounded-lg">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="px-3 py-2 text-sm flex-1 text-white placeholder:text-[rgb(87,94,108)] border-none outline-none"
          step="0.001"
        />
        <button
          onClick={() => setQuantity(Number(data.payload.btc.amount).toFixed(10))}
          className="w-fit px-4 text-main text-[11px] flex gap-1 items-center cursor-pointer"
        >
          max
        </button>
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
          className="bg-[#2ebd85] cursor-pointer hover:bg-[#2ebd84] rounded py-2 font-semibold transition-colors text-sm"
        >
          BUY
        </button>
        <button
          onClick={() => trade("SELL")}
          className="bg-red cursor-pointer hover:bg-[#f64646] rounded py-2 font-semibold transition-colors text-sm"
        >
          SELL
        </button>
      </div>

      <div className="text-sm text-gray-400 text-center">
        Est. USDT: ${(quantity * price).toFixed(20)}
      </div>
    </div>
  );
};

export default Spot;

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
