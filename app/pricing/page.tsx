"use client";

import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { IoArrowBack } from "react-icons/io5";

export default function FundedAccountsPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const packs = [
    {
      name: "Basic",
      price: "5",
      color: "from-blue-500 to-blue-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $250",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Standard",
      price: "10",
      color: "from-purple-500 to-purple-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $500",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Advanced",
      price: "15",
      color: "from-amber-500 to-amber-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $1,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Pro",
      price: "30",
      color: "from-red-500 to-red-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $2,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Elite",
      price: "50",
      color: "from-pink-500 to-pink-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $5,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Master",
      price: "99",
      color: "from-emerald-500 to-emerald-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $10,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Institutional",
      price: "250",
      color: "from-cyan-500 to-cyan-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $25,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Professional",
      price: "500",
      color: "from-indigo-500 to-indigo-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $50,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Prime",
      price: "999",
      color: "from-yellow-500 to-yellow-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $100,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Ultimate",
      price: "1350",
      color: "from-fuchsia-500 to-fuchsia-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $120,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 3%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
  ];

  async function buyPlan(amount: number, planType: string) {
    const res = await fetch("/api/buy-plan", {
      method: "POST",
      body: JSON.stringify({ amount, planType }),
    });

    if (res.ok) {
      enqueueSnackbar("Plan purchased successfully", { variant: "success" });
      setTimeout(() => router.push("/profile"), 1000);
    } else {
      const data = await res.json();
      enqueueSnackbar(data?.error || "Purchase failed", {
        variant: "error",
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* TOP BAR */}
      <div className="bg-linear-to-r from-[#0f1620] to-[#1b2838] border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl p-4">
          <h1 className="text-3xl font-extrabold mb-2">
            Funded Account Plans
          </h1>
          <Link
            href="/"
            className="text-gray-300 hover:text-main transition-all flex items-center gap-1 text-sm"
          >
            <IoArrowBack /> Go Home
          </Link>
        </div>
      </div>

      {/* NOTICE */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-[#1b2230] border-l-4 border-main p-5 rounded-lg">
          <h3 className="font-semibold mb-1">Important Notice</h3>
          <p className="text-gray-400 text-sm mb-2">
            Purchasing a funded account means you agree to our Terms &
            Conditions.
          </p>
          <Link
            href="/terms"
            className="text-main hover:underline text-sm font-medium"
          >
            Read Terms & Conditions →
          </Link>
        </div>
      </div>

      {/* PLANS */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack, i) => (
          <div
            key={i}
            className="bg-[#111821] border border-white/10 rounded-2xl overflow-hidden shadow-lg"
          >
            <div className={`h-2 bg-linear-to-r ${pack.color}`} />
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-main">
                  {pack.name}
                </h3>
                <span className="text-xs bg-white/10 px-2 py-1 rounded">
                  {pack.profitShare} Split
                </span>
              </div>

              <div className="text-3xl font-bold">${pack.price}</div>

              <ul className="space-y-2 text-sm text-gray-300">
                {pack.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-2 items-center">
                    <Check className="w-4 h-4 text-green-400" /> {rule}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => buyPlan(+pack.price, pack.name)}
                className="w-full py-3 rounded-xl bg-main text-black font-semibold hover:bg-[#58c0bc] transition"
              >
                Buy Now <ArrowRight className="inline w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
