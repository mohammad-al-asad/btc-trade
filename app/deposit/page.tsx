"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import qr from "@/public/qr.jpg";

export default function DepositPage() {
  const { status } = useSession();
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
        {/* QR Code and Bitcoin Address */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Send Bitcoin to this address
          </h3>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <Image
              className="rounded-2xl border border-white"
              width={200}
              height={200}
              src={qr}
              alt="deposit qr code"
            />
          </div>

          {/* Bitcoin Address */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Bitcoin Address</p>
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-sm font-mono break-all">
                1LWVfFQCxasdjo34dWtMn11EKS7GCERCZH
              </p>
            </div>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  "1LWVfFQCxasdjo34dWtMn11EKS7GCERCZH"
                )
              }
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              Copy Address
            </button>
          </div>
        </div>

        {/* Deposit Form */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <form onSubmit={handleDeposit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (BTC)
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
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Bitcoin transaction ID"
                required
              />
              <p className="text-xs text-gray-400 mt-1 ml-1.5">
                Enter the Bitcoin transaction ID from your wallet
              </p>
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

        {/* Instructions */}
        <div className="bg-gray-800 rounded-2xl p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Deposit Instructions</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-xs font-bold">1</span>
              </div>
              <p>Send Bitcoin to the address shown above</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-xs font-bold">2</span>
              </div>
              <p>Wait for the transaction to be confirmed on the blockchain</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-xs font-bold">3</span>
              </div>
              <p>Enter the amount and transaction ID in the form above</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-xs font-bold">4</span>
              </div>
              <p>Your deposit will be processed after admin approval</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
