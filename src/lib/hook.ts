/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useCurrentUser = () => {
  const session: any = useSession();
  return session?.data?.user || null;
};

export const useSize = (): "SM" | "MD" | "LG" => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width < 600 ? "SM" : width < 750 ? "MD" : "LG";
};
