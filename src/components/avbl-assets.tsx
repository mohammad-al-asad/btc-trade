/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { getUserAssets } from "../lib/queries";
import Link from "next/link";
import { AiFillPlusCircle } from "react-icons/ai";
import { useCurrentUser } from "../lib/hook";

const AvblAssets = ({ hide = "NO" }: { hide?: "USDT" | "BTC" | "NO" }) => {
  const user = useCurrentUser();
  const [quantity, setQuantity] = useState<any>(1);
  const { data } = useQuery({
    queryKey: ["btc-price"],
    queryFn: getUserAssets,
    refetchInterval: 1000,
  });
  if (!user) {
    return null;
  }
  return (
    <div className="space-y-1.5 sticky bottom-0">
      <div
        className={`flex justify-between items-center ${
          hide == "USDT" && "hidden"
        }`}
      >
        <span className="text-xs text-gray-300">Avbl (USDT)</span>
        {/* <span>{data.payload.usdt}</span> */}
        <span className="text-xs text-white font-medium flex gap-1">
          ${data?.payload?.usdt?.amount}
          <Link href="/deposit">
            <AiFillPlusCircle className="text-green-500" />
          </Link>
        </span>
      </div>
      <div
        className={`flex justify-between items-center ${
          hide == "BTC" && "hidden"
        }`}
      >
        <span className="text-xs text-gray-300">Avbl (BTC)</span>
        <span className="text-xs text-white font-medium">
          ₿{data?.payload?.btc?.amount}
        </span>
        {/* <span>{data.payload.btc}</span> */}
      </div>
    </div>
  );
};

export default AvblAssets;
