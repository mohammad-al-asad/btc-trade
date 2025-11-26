"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdContentCopy } from "react-icons/md";
import { PageHeader } from "@/src/components/simple-page-header";
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
    <div className="min-h-screen bg-[#080808] text-white">
      <PageHeader label="Deposit" />
      <div className="container mx-auto py-20 p-4 max-w-md">
        <div >
          <img
            src="https://cdn.vectorstock.com/i/1000v/17/88/qr-code-with-bitcoin-sign-symbol-for-internet-vector-29001788.jpg"
            alt="Bitcoin qr"
            className="w-[200px] mx-auto rounded-xl "
          />

          <div className="mt-6">
            <span className="text-gray-400 text-xs">Network</span>
            <br />
            <span className="text-white font-semibold text-sm">BTC</span>
            <br />
            <span className="text-gray-400 text-xs">Bitcoin</span>
          </div>

          <h4 className="text-sm font-semibold text-white mt-5 mb-2">
            Deposit Address
          </h4>
          <div className="bg-[rgb(25,25,25)] border cursor-pointer border-[rgb(39,39,39)] rounded-3xl py-5 px-4 relative mb-5">
            <span className="text-sm text-white">
              1Gx9FCknxSsLfFDzFdn75Xgqx95sDp38ir
            </span>
            <button className="top-1/2 -translate-y-1/2 right-5 absolute ">
              <MdContentCopy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center py-20">
          <button className="text-sm font-semibold  block text-center cursor-pointer bg-blue-600 w-full rounded-xl py-3 text-white">
            Tranasiction
          </button>
        </div>

        {/* Deposit Form */}
        {/* <div className="bg-gray-800 rounded-2xl p-6">
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
        </div> */}
      </div>
    </div>
  );
}
