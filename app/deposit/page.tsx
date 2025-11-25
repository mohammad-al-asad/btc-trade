"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DepositPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [transaction, setTransaction] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

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
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Deposit successful! Redirecting...");
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 max-w-md">
        {/* Deposit Form */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <form onSubmit={handleDeposit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="10"
                required
              />
              <p className="text-xs text-gray-400 mt-1 ml-1.5">
                Minimum deposit: $50.00
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transaction ID
              </label>
              <input
                type="text"
                value={transaction}
                onChange={(e) => setTransaction(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="10"
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
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-lg"
            >
              {processing ? "Processing..." : "Request Deposit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
