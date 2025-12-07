import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/src/components/SessionProvider";
import ReactQueryProvider from "../src/components/ReactQueryProvider";
import { ToDoProvider } from "../src/components/TodoProvider";
import { Suspense } from "react";
import { FaWhatsapp } from "react-icons/fa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SORA",
  description: "The funded account",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <ToDoProvider>
            <ReactQueryProvider>
              <SessionProvider>{children}</SessionProvider>
            </ReactQueryProvider>
          </ToDoProvider>
        </Suspense>

        {/* 🟢 Floating WhatsApp Button */}
        <a
          href="https://wa.me/+923348536778?text=Hello%20I%20need%20help"
          target="_blank"
          rel="noopener noreferrer"
          className="
            fixed 
            bottom-5 
            right-5 
            bg-green-500 
            hover:bg-green-600 
            text-white 
            w-12 
            h-12 
            rounded-full 
            flex 
            items-center 
            justify-center 
            shadow-lg 
            z-50
          "
        >
          <FaWhatsapp size={32} />
        </a>
      </body>
    </html>
  );
}
