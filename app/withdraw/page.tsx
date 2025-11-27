"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WithdrawPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !walletAddress) return;

    setProcessing(true);
    setMessage("");

    try {
      const response = await fetch("/api/transactions/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          walletAddress,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Withdrawal request submitted! Redirecting...");
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } else {
        setMessage(result.error || "Failed to process withdrawal");
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
        {/* Withdrawal Form */}
        <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#9aa3b2] mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#111] border border-[#232323] rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="10"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum withdrawal: $10.00
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9aa3b2] mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full bg-[#111] border border-[#232323] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your wallet address"
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes("submitted")
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
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-lg"
            >
              {processing ? "Processing..." : "Request Withdrawal"}
            </button>
          </form>
        </div>

        {/* Withdrawal Info */}
        <div className="bg-[#0f1113]/60 border border-[#222] rounded-2xl p-6 mt-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Withdrawal Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Processing Time</span>
              <span>1-3 business days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Withdrawal Fee</span>
              <span>1% (min $1.00)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Minimum Amount</span>
              <span>$100.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
