/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import LeverageRange from "./leverage-range";
import { IoMdArrowDropdown } from "react-icons/io";
import AvblAssets from "./avbl-assets";
import { usePrice } from "../lib/store";
import { useSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";
import { getUserAssets } from "../lib/queries";
import { useCurrentUser } from "../lib/hook";
import { useRouter } from "next/navigation";
const Future = () => {
  const user = useCurrentUser();
  const { price: btcCurrentPrice } = usePrice((state) => state);
  const [tradeType, setTradeType] = useState<"MARKET" | "SPORT">("MARKET");

  const [leverage, setLeverage] = useState<number>(5);
  const [margin, setMargin] = useState<number>(1);
  const [cost, setCost] = useState<number>(0);
  const { enqueueSnackbar } = useSnackbar();
  const btcPrice = usePrice((state) => state.price);

  const router = useRouter();

  const handleTrade = async (trade: "SHORT" | "LONG") => {
    if (!user) return router.push("/auth/sigin");
    const response = await fetch("api/trade/future", {
      method: "POST",
      body: JSON.stringify({
        leverage,
        margin: margin / btcPrice,
        trade,
        btcCurrentPrice,
      }),
    });
    const data = await response.json();
    if (data?.error) {
      enqueueSnackbar(data.error, { variant: "error" });
    } else if (data?.message) {
      enqueueSnackbar("Order Created", { variant: "success" });
    }
  };

  const { data } = useQuery({
    queryKey: ["btc-price"],
    queryFn: getUserAssets,
    refetchInterval: 1000,
  });

  return (
    <div className="p-1.5 lg:p-3">
      <div className="flex justify-between gap-1.5">
        <div className=" w-full">
          <label
            htmlFor=""
            className="text-xs lg:text-sm   mb-1 text-gray-400 block"
          >
            Type
          </label>
          <select
            defaultValue={"MARKET"}
            onChange={(e: any) => setTradeType(e.target.value)}
            value={tradeType}
            name="trade-type"
            className="text-xs lg:text-sm w-full block border border-[rgb(69,76,89)] p-1 lg:p-2 rounded-sm outline-none focus:ring focus:ring-[rgb(108,244,239)]"
          >
            <option value="market">Market</option>
          </select>
        </div>
      </div>
      <div className="py-2 lg:py-3  ">
        <label
          htmlFor=""
          className="text-xs lg:text-sm  mb-1 text-gray-400 block"
        >
          Leverage <span className="text-white font-medium">({leverage})</span>
        </label>
        <LeverageRange onValueChange={(value) => setLeverage(value)} />
      </div>

      <div className="py-2 lg:py-3">
        <label
          htmlFor=""
          className="text-xs lg:text-sm  mb-1 text-gray-400 block"
        >
          Margin
        </label>
        <div className="relative flex justify-between items-center border-[rgb(69,76,89)] border rounded-lg">
          <input
            value={margin}
            onChange={(e: any) => setMargin(e.target.value)}
            type="number"
            placeholder="Amount in USDT"
            className="px-3 py-2 text-sm flex-1 text-white placeholder:text-[rgb(87,94,108)] border-none outline-none"
          />
          <button
            onClick={() => setMargin(data.payload.usdt.amount)}
            className="w-fit px-4 text-main text-[11px] flex gap-1 items-center cursor-pointer"
          >
            max
          </button>
        </div>
      </div>

      <AvblAssets hide="BTC" />
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-300">Cost</span>
        <span className="text-xs text-white font-medium">${margin}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 lg:mt-4">
        <button
          onClick={() => handleTrade("LONG")}
          className="bg-[#2ebd85] cursor-pointer hover:bg-[#2ebd84] rounded py-2 font-semibold transition-colors text-sm"
        >
          Long
        </button>
        <button
          onClick={() => handleTrade("SHORT")}
          className="bg-red cursor-pointer hover:bg-[#f64646] rounded py-2 font-semibold transition-colors text-sm"
        >
          Short
        </button>
      </div>
    </div>
  );
};

export default Future;
