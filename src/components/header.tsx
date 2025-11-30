"use client";
import { GiUpgrade } from "react-icons/gi";
import { useCurrentUser } from "../lib/hook";
import Link from "next/link";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import logo from "../../public/logo.avif";
import { signOut } from "next-auth/react";

const Header = () => {
  const user = useCurrentUser();
  return (
    <header className="flex items-center border-b border-b-gray-800 px-4 md:px-10 lg:px-16 justify-between py-2 md:py-3 ">
      {/* Logo */}
    <header className="flex items-center  bg-[rgb(24,26,31)] px-4 md:px-10 lg:px-16 justify-between py-2 md:py-4 ">
      <Link href="/" className="flex items-center gap-3">
        <Image src={logo} alt="Trading" width={80} className="w-[50px]" />
        <div className="text-main font-serif">
          <h1 className="font-bold text-2xl">SORA</h1>
          <p className="text-[9px] leading-2">The funded account</p>
        </div>
      </Link>

      {/* User Actions */}
      <div className="flex gap-2 lg:gap-4 items-center">
        {user && (
          <>
            {/* Navigation */}
            <nav className="flex items-center gap-6 transition-all">
              <Link
                href="/pricing"
                className="hover:text-main text-md font-medium transition-colors flex gap-2 justify-center items-center"
              >
                <GiUpgrade className="w-[15px] h-[15px] hover:text-main" />
                Upgrade
              </Link>
              <Link
                href="/profile"
                className="hover:text-main text-md font-medium transition-colors flex gap-2 justify-center items-center"
              >
                <FaUser className="w-[13px] h-[13px] hover:text-main" />
                Profile
              </Link>
            </nav>
          </>
        )}
        {!user && <AuthButton />}
        {user && <Logout />}
      </div>
    </header>
  );
};

export default Header;

const AuthButton = () => {
  return (
    <Link
      href="/auth/signin"
      type="button"
      className="rounded-md px-6 py-2 text-white font-semibold shadow-lg bg-[#22835b] hover:bg-[#1f7a50] transition-colors"
    >
      Signin
    </Link>
  );
};

const Logout = () => {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
    >
      Sign Out
    </button>
  );
};
