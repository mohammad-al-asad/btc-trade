"use client";
import Chart from "../src/components/chart";
import { useEffect, useState } from "react";

export default function Home() {
  const [btcModify, setBtcModify] = useState<string>();
  useEffect(() => {
    const loadBtcData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/btc-modify`);
      const { modifyData } = await res.json();

      setBtcModify(modifyData.adjustment);
    };
    loadBtcData();
  }, []);
  if (!btcModify && Number(btcModify)!=0) return null;
  return (
    <div>
      <Chart btcModify={btcModify!} />
    </div>
  );
}
