/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import SignupRewardModal from "@/src/components/SignupRewardModal";
import Chart from "../src/components/chart";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [btcModify, setBtcModify] = useState<string>();

  useEffect(() => {
    const loadBtcData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/btc-modify`
      );
      const { modifyData } = await res.json();

      setBtcModify(modifyData.adjustment);
    };
    loadBtcData();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      setOpen(true);
    }
  }, [status]);

  if (!btcModify && Number(btcModify) != 0) return null;
  return (
    <div>
      <SignupRewardModal open={open} onClose={() => setOpen(false)} />
      <Chart btcModify={btcModify!} />
    </div>
  );
}
