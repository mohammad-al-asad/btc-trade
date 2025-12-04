"use client";

import { Check, TrendingUp, ArrowRight } from "lucide-react";
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
      price: "99",
      color: "from-blue-500 to-blue-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $5,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 4%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Standard",
      price: "199",
      color: "from-purple-500 to-purple-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $10,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 4%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Advanced",
      price: "499",
      color: "from-amber-500 to-amber-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $25,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 4%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Pro",
      price: "1000",
      color: "from-red-500 to-red-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $50,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 4%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
    {
      name: "Elite",
      price: "1350",
      color: "from-pink-500 to-pink-700",
      profitShare: "95%",
      scaling: false,
      rules: [
        "Account Size: $100,000",
        "Daily Loss Limit: 2%",
        "Maximum Loss Limit: 4%",
        "Consistency Rule: 15%",
        "Minimum Trading Days: 10",
      ],
    },
  ];

  async function buyPlan(amount: number, planType: string) {
    const res = await fetch("/api/buy-plan", {
      method: "POST",
      body: JSON.stringify({
        amount,
        planType,
      }),
    });
    if (res.ok) {
      enqueueSnackbar("Plan purchased", { variant: "success" });
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* ======= TOP SECTION ======= */}
      <div className="bg-linear-to-r from-[#0f1620] to-[#1b2838] border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl p-4">
          <h1 className="text-3xl font-extrabold mb-2">Funded Account Plans</h1>
          <div className="flex gap-4 text-sm">
            <Link
              href="/"
              className="text-gray-300 hover:text-main transition-all flex items-center gap-0.5"
            >
              <IoArrowBack />
              Go Home
            </Link>
          </div>
        </div>
      </div>

      {/* IMPORTANT NOTICE */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-[#1b2230] border-l-4 border-main p-5 rounded-lg shadow-md">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-main shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m0-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>

            <div>
              <h3 className="text-lg font-semibold text-white">
                Important Notice
              </h3>
              <p className="text-gray-400 mb-3">
                By purchasing a funded account, you agree to our Terms &
                Conditions. Please read them carefully before proceeding.
              </p>
              <Link
                href="/terms"
                className="inline-flex items-center text-main hover:text-[#58c0bc] transition-all font-medium text-sm"
              >
                Read Terms & Conditions
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-5 space-y-10">
        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack, i) => (
            <div
              key={i}
              className="bg-[#111821] border border-white/10 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
            >
              {/* TOP GRADIENT BAR */}
              <div className={`h-2 bg-linear-to-r ${pack.color}`} />

              {/* HEADER */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-main">
                    {pack.name}
                  </span>

                  <span className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/10">
                    {pack.profitShare} Split
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-6 space-y-4">
                <div className="text-3xl font-bold text-white">
                  ${pack.price}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    Scaling Program:{" "}
                    <strong className="text-white">
                      {pack.scaling ? "Yes" : "No"}
                    </strong>
                  </span>
                </div>

                {/* RULES */}
                <ul className="space-y-2 text-sm text-gray-300">
                  {pack.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" /> {rule}
                    </li>
                  ))}
                </ul>

                {/* BUTTON */}
                <button
                  onClick={() => buyPlan(+pack.price, pack.name)}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-main text-black font-semibold hover:bg-[#58c0bc] transition-all"
                >
                  Buy Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-[#111821] border border-white/10 rounded-2xl p-7 shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-main mb-3">
            How Funding Works
          </h2>
          <p className="text-gray-300 leading-relaxed max-w-xl mx-auto">
            Pick a plan, pass the evaluation (if required), and receive a funded
            account. Withdraw your profits based on your assigned profit split.
          </p>
        </div>
      </div>
    </div>
  );
}
