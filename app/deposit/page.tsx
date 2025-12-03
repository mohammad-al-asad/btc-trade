"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import qr from "@/public/qr.jpg"; // BTC QR
import usdtQR from "@/public/usdtQR.png"; // USDT QR
import { FaCopy } from "react-icons/fa";

export default function DepositPage() {
  const { status } = useSession();
  const router = useRouter();

  // Selected payment method
  const [method, setMethod] = useState<"btc" | "usdt">("usdt");

  // Deposit form states
  const [transaction, setTransaction] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const params = useSearchParams();
  const usdt = params.get("usdt");
  const [amount, setAmount] = useState(usdt || "0");

  // Addresses
  const addresses = {
    btc: "1LWVfFQCxasdjo34dWtMn11EKS7GCERCZH",
    usdt: "TH5pbgtKshyoP1XeUTF6nfuhtFN6NEcnLb",
  };

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setProcessing(true);
    setMessage("");

    try {
      const response = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          transaction,
          currency: method == "usdt" ? "USD" : "BTC",
        }),
      });

      const result = await response.json();
      console.log(result);
      

      if (response.ok) {
        setMessage("Deposit successful! Redirecting...");
        setTimeout(() => router.push("/profile"), 2000);
      } else {
        setMessage(result.error || "Failed to process deposit");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-[#0d0d0d] to-black text-white">
      <div className="container mx-auto p-4 max-w-md">
        {/* Method Selector */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMethod("usdt")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              method === "usdt"
                ? "bg-main text-black border-[#222]"
                : "bg-[#111] border-[#222] text-gray-300"
            }`}
          >
            USDT (TRC20)
          </button>

          <button
            onClick={() => setMethod("btc")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              method === "btc"
                ? "bg-main text-black border-[#222]"
                : "bg-[#111] border-[#222] text-gray-300"
            }`}
          >
            Bitcoin (BTC)
          </button>
        </div>

        {/* QR + Address Box */}
        <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {method === "btc" ? "Bitcoin Address" : "USDT (TRC20) Address"}
          </h3>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <Image
              className="rounded-2xl border border-[#333]"
              width={200}
              height={200}
              src={method === "btc" ? qr : usdtQR}
              alt="Deposit QR"
            />
          </div>

          {/* Address */}
          <div className="text-center">
            <div className="relative">
              <div className="bg-[#111] border border-[#232323] rounded-lg p-3 pr-10">
                <p className="text-sm font-mono break-all">
                  {addresses[method]}
                </p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(addresses[method])}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-main hover:text-blue-300 transition-colors"
                title="Copy Address"
              >
                <FaCopy size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Deposit Form */}
        <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleDeposit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#9aa3b2] mb-2">
                Amount ({method === "btc" ? "BTC" : "USDT"})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#111] border border-[#232323] rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-main"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9aa3b2] mb-2">
                Transaction ID / Hash
              </label>
              <input
                type="text"
                value={transaction}
                onChange={(e) => setTransaction(e.target.value)}
                className="w-full bg-[#111] border border-[#232323] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-main"
                placeholder="Enter transaction hash"
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes("successful")
                    ? "bg-green-900/50 text-green-200"
                    : "bg-red-900/50 text-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-lg"
            >
              {processing ? "Processing..." : "Request Deposit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
