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
import Spot from "./spot";
import Future from "./future";
const TradePanel = ({ price }: { price: number }) => {
  const [quantity, setQuantity] = useState<any>(1);
  const [tabs, setTabs] = useState<"SPOT" | "FUTURE">("SPOT");

  return (
    <div className="bg-[rgb(24,26,31)] border border-[#1f2328] rounded-lg ">
      <h3 className="text-base lg:text-lg font-semibold mb-2 lg:mb-4 p-2 lg:p-4">
        Trade
      </h3>

      <div className="px-1.5 md:px-2 py-1 scroll-hide flex gap-2 flex-none max-w-full overflow-auto border-b border-b-[rgb(53,59,70)] mb-2 lg:my-3">
        <button
          onClick={() => setTabs("SPOT")}
          className={`cursor-pointer relative w-fit px-1 py-1 text-sm font-semibold ${
            tabs == "SPOT" ? "text-white " : "text-[rgb(148,154,164)]"
          } `}
        >
          SPOT
          {tabs == "SPOT" && (
            <div className="-bottom-1 left-1/2 -translate-x-1/2 absolute w-1/2 h-0.5 bg-[rgb(108,244,239)]"></div>
          )}
        </button>
        <button
          onClick={() => setTabs("FUTURE")}
          className={`cursor-pointer w-fit relative px-1 py-1 text-sm font-semibold  ${
            tabs == "FUTURE" ? "text-white " : "text-[rgb(148,154,164)]"
          } `}
        >
          FUTURE
          {tabs == "FUTURE" && (
            <div className="-bottom-1 left-1/2 -translate-x-1/2 absolute w-1/2 h-0.5 bg-[rgb(108,244,239)]"></div>
          )}
        </button>
        
      </div>

      {tabs == "SPOT" && <Spot />}
      {tabs == "FUTURE" && <Future />}
    </div>
  );
};

export default TradePanel;
