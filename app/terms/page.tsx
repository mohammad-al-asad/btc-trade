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
          By purchasing or using any funded account plan offered by this
          company, you agree to follow all Terms and Conditions listed below. If
          you do not agree, please stop using our services.
        </Section>

        {/* 2. Instant Funded Account */}
        <Section title="2. Instant Funded Account" icon={<FaClipboardCheck />}>
          Upon successful purchase of any plan, the user will receive an instant
          funded account without any challenge or evaluation.
        </Section>

        {/* 3. Eligibility */}
        <Section title="3. Eligibility" icon={<FaShieldAlt />}>
          Users must be at least 18 years old and provide accurate personal
          information during registration.
        </Section>

        {/* 4. Trading Rules */}
        <Section title="4. Trading Rules" icon={<FaMoneyBillWave />}>
          <ul className="space-y-2 text-gray-300">
            <li>
              • Daily Loss Limit: <strong>2%</strong> of account balance
            </li>
            <li>
              • Max Overall Loss Limit: <strong>4%</strong> of account balance
            </li>
            <li>• Proper risk management must be followed</li>
          </ul>
        </Section>

        {/* 5. Consistency Rule */}
        <Section title="5. Consistency Rule" icon={<FaClipboardCheck />}>
          The user must maintain a 15% consistency rule, meaning no single
          trading day’s profit should exceed 15% of the total profit made during
          the trading period.
        </Section>

        {/* 6. Minimum Trading Days */}
        <Section title="6. Minimum Trading Days" icon={<FaClipboardCheck />}>
          Users are required to trade for at least 10 trading days before any
          payout eligibility or fund evaluation.
        </Section>

        {/* 7. Payouts */}
        <Section title="7. Payouts" icon={<FaMoneyBillWave />}>
          Payouts will only be processed once all rules are met. Any violation
          may result in payout cancellation.
        </Section>

        {/* 8. Refund Policy */}
        <Section title="9. Refund Policy" icon={<FaClipboardCheck />}>
          All purchases of funded account plans are final. No refunds will be
          issued unless specifically mentioned by the company.
        </Section>

        {/* 9. Platform & Data */}
        <Section title="10. Platform & Data" icon={<FaShieldAlt />}>
          The company may update or change tools, account structures, or trading
          platforms without notice. The company is not responsible for outages,
          delays, or technical issues.
        </Section>

        {/* 10. Liability Disclaimer */}
        <Section title="11. Liability Disclaimer" icon={<FaBook />}>
          Trading involves financial risk. The company is not responsible for
          user’s trading decisions, losses, or profits.
        </Section>

        {/* 11. Modification of Terms */}
        <Section title="13. Modification of Terms" icon={<FaClipboardCheck />}>
          The company may update these Terms & Conditions at any time. Continued
          use means acceptance of updated terms.
        </Section>

        {/* 12. Contact */}
        <Section title="14. Contact" icon={<FaShieldAlt />}>
          For support or queries, users may contact the official company email
          or support portal.
        </Section>

        {/* 13. Account Suspension */}
        <Section
          title="12. Account Suspension / Termination"
          icon={<FaExclamationTriangle />}
          danger
        >
          <ul className="space-y-2 text-gray-300">
            <li>• Violating trading rules</li>
            <li>• Fraudulent activity</li>
            <li>• System abuse or misuse</li>
          </ul>
        </Section>

        {/* 14. Violations */}
        <Section title="8. Violations" icon={<FaExclamationTriangle />} danger>
          <ul className="space-y-2 text-gray-300">
            <li>• Violation of loss limits</li>
            <li>• Fraudulent activity</li>
            <li>• System abuse or exploitation</li>
          </ul>
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
          danger ? "text-red-400" : "text-main"
        }`}
      >
        {icon} {title}
      </h2>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}
