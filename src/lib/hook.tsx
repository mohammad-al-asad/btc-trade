"use client";

import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const session : any= useSession();
  return session?.data?.user
 || null;
};
