"use client";
import React from "react";
import { useCurrentUser } from "../lib/hook";
import Link from "next/link";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import logo from "../../public/logo.avif";
import { signOut } from "next-auth/react";

const Header = () => {
  const user = useCurrentUser();
  return (
    <header className="flex items-center border-b border-b-gray-800 px-4 md:px-10 lg:px-16 justify-between py-2 md:py-4 ">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src={logo}
          alt="Trading"
          width={80}
          className="w-[50px] "
          // placeholder="blur"
        />
        <div className="text-[rgb(108,244,239)] font-serif">
          <h1 className="font-bold text-2xl">SORA</h1>
          <p className="text-[9px] leading-2">The funded account</p>
        </div>
      </Link>
      <span className="text-sm text-gray-300"></span>
      <div className="flex gap-2 lg:gap-4 items-center">
        {!user && <AuthButton />}
        {user && <Logout />}
        {user && (
          <Link href="/profile">
            <FaUser className="w-4 h-4 " />
          </Link>
        )}
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
      className={
        // rounded 2xl, padding, white text, bold, subtle shadow
        "rounded-md px-6 py-2 text-white font-semibold shadow-lg bg-[#22835b]"
        // main gradient (90deg) from solid #02C173 (100%) -> #02C173 15% opacity (100%)

        // small hover effect: slightly stronger tail
      }
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
