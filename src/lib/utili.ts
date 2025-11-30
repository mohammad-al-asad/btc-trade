import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export const getCurrentUser = async () => {
  const session: any = await getServerSession(authOptions);
  return session?.user || null;
};

