"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

interface SignupRewardModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SignupRewardModal({
  open,
  onClose,
}: SignupRewardModalProps) {
  // Prevent background scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-[90%] max-w-md rounded-2xl border border-gray-800 bg-[rgb(24,26,31)] p-6 shadow-xl">
        {/* Close button */}
        {/* <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button> */}

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            Sign up & Get <span className="text-main">$4</span> Rewards
          </h2>

          <p className="mt-3 text-sm text-gray-400">
            Create your free account today and receive a $20 trading reward.
            No hidden fees. Instant access.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-[#22835b] px-5 py-2.5 text-white font-semibold hover:bg-[#1f7a50] transition"
            >
              Sign Up Now
            </Link>

            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
