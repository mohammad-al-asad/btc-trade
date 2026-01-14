"use client";
import Link from "next/link";
import {
  FaBook,
  FaClipboardCheck,
  FaShieldAlt,
  FaMoneyBillWave,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* ======= TOP SECTION ======= */}
      <div className="bg-linear-to-r from-[#0f1620] to-[#1b2838] border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-3xl font-extrabold mb-2">Terms & Conditions</h1>
          <div className="flex gap-4 text-sm">
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-main transition"
            >
              Get Funded
            </Link>
            <Link href="/" className="text-gray-300 hover:text-main transition">
              Go Home
            </Link>
          </div>
        </div>
      </div>

      {/* ======= MAIN CONTENT ======= */}
      <div className="container mx-auto max-w-6xl px-4 py-10 space-y-10">
        {/* 1. Introduction */}
        <Section title="1. Introduction" icon={<FaBook />}>
          By purchasing or using any funded account plan offered by this company,
          you agree to comply with all Terms and Conditions listed below. If you
          do not agree, you must immediately discontinue use of our services.
        </Section>

        {/* 2. Instant Funded Account */}
        <Section title="2. Instant Funded Account" icon={<FaClipboardCheck />}>
          Upon successful purchase of any plan, the user will receive an instant
          funded account without any challenge or evaluation phase.
        </Section>

        {/* 3. Eligibility */}
        <Section title="3. Eligibility" icon={<FaShieldAlt />}>
          Users must be at least 18 years old and must provide accurate and
          truthful personal information during registration.
        </Section>

        {/* 4. Trading Rules */}
        <Section title="4. Trading Rules" icon={<FaMoneyBillWave />}>
          <ul className="space-y-2 text-gray-300">
            <li>
              • Daily Loss Limit: <strong>2%</strong> of the account balance
            </li>
            <li>
              • Maximum Overall Loss Limit: <strong>3%</strong> of the account
              balance
            </li>
            <li>
              • Traders must maintain the <strong>15% consistency rule</strong>
            </li>
            <li>• Proper risk management must be followed at all times</li>
          </ul>
        </Section>

        {/* 5. Discount & Signup Bonus Policy */}
        <Section title="5. Discount & Signup Bonus Policy" icon={<FaMoneyBillWave />}>
          <p className="text-gray-300 leading-relaxed">
            BTC price differences or promotional credits are used strictly as a
            pricing discount mechanism. For example, if a user deposits $180 and
            receives a $200 plan value, the difference represents a discount
            only.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            This discount may include promotional or signup bonuses (such as a
            $4 signup bonus). These bonuses are <strong>non-withdrawable</strong>{" "}
            under all circumstances and cannot be considered profit.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            Only profits generated through legitimate trading activity, while
            fully complying with all rules, are eligible for withdrawal.
          </p>
        </Section>

        {/* 6. Consistency Rule */}
        <Section title="6. Consistency Rule" icon={<FaClipboardCheck />}>
          Traders must maintain a 15% consistency rule, meaning no single trading
          day’s profit may exceed 15% of the total accumulated profit during the
          trading period.
        </Section>

        {/* 7. Minimum Trading Days */}
        <Section title="7. Minimum Trading Days" icon={<FaClipboardCheck />}>
          Traders are required to complete a minimum of <strong>10 trading
          days</strong> before becoming eligible for any payout or performance
          evaluation.
        </Section>

        {/* 8. Payouts */}
        <Section title="8. Payouts" icon={<FaMoneyBillWave />}>
          Payouts will only be processed after all trading rules, consistency
          requirements, and minimum trading days have been fully satisfied. Any
          violation will result in payout cancellation.
        </Section>

        {/* 9. Refund Policy */}
        <Section title="9. Refund Policy" icon={<FaClipboardCheck />}>
          All purchases of funded account plans are final. No refunds will be
          issued unless explicitly stated otherwise by the company.
        </Section>

        {/* 10. Platform & Data */}
        <Section title="10. Platform & Data" icon={<FaShieldAlt />}>
          The company reserves the right to modify, update, or discontinue any
          platform features, tools, or account structures at any time without
          prior notice.
        </Section>

        {/* 11. Liability Disclaimer */}
        <Section title="11. Liability Disclaimer" icon={<FaBook />}>
          Trading involves significant financial risk. The company is not
          responsible for any losses incurred as a result of the user’s trading
          decisions.
        </Section>

        {/* 12. Modification of Terms */}
        <Section title="12. Modification of Terms" icon={<FaClipboardCheck />}>
          The company may revise or update these Terms & Conditions at any time.
          Continued use of services constitutes acceptance of the updated terms.
        </Section>

        {/* 13. Contact */}
        <Section title="13. Contact" icon={<FaShieldAlt />}>
          For support or inquiries, users may contact the official company email
          address or support portal.
        </Section>

        {/* 14. Account Suspension / Termination */}
        <Section
          title="14. Account Suspension / Termination"
          icon={<FaExclamationTriangle />}
          danger
        >
          <ul className="space-y-2 text-gray-300">
            <li>• Violation of daily or overall loss limits</li>
            <li>• Breach of the 15% consistency rule</li>
            <li>• Failure to complete minimum trading days</li>
            <li>• Misuse of discounts, bonuses, or system exploitation</li>
            <li>• Fraudulent, unfair, or abusive trading behavior</li>
          </ul>
          <p className="mt-4 text-gray-300">
            Any violation may result in <strong>immediate account suspension or
            termination without refund</strong>. The company’s decision shall be{" "}
            <strong>final and binding</strong>.
          </p>
        </Section>

        {/* 15. Violations */}
        <Section title="15. Violations" icon={<FaExclamationTriangle />} danger>
          <ul className="space-y-2 text-gray-300">
            <li>• Loss limit violations</li>
            <li>• Fraud or manipulation</li>
            <li>• System abuse or unfair trading practices</li>
          </ul>
          <p className="mt-4 text-gray-300">
            Confirmed violations will result in permanent account action with no
            eligibility for refunds or withdrawals.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
  danger,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="bg-[#111821] border border-white/10 rounded-2xl p-7 shadow-lg">
      <h2
        className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${
          danger ? "text-main" : "text-main"
        }`}
      >
        {icon} {title}
      </h2>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}
