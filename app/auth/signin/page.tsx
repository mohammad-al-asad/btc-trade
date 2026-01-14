"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        alert("Invalid credentials");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(12,14,17)] flex items-center justify-center">
      <div className="bg-bg p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Sign In to Trading Platform
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-main"
              placeholder="demo@trading.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-main"
              placeholder="demo123"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-main hover:bg-[#56cdc9] disabled:bg-[#2c6f6d] text-black font-semibold py-2 px-4 rounded-lg duration-100 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-main hover:text-[#56cdc9] transition-colors duration-100"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
