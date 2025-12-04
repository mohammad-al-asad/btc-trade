import { hashPassword } from "@/src/lib/bcrypt";
import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, deviceName } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const networkIP = forwarded ? forwarded.split(",")[0] : "unknown";

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with whitelist entry
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        plan:{
          create:{
            type:"free"
          }
        },
        assets: {
          create: [
            { amount: 0.0, assetName: "BTC" },
            { amount: 0.0, assetName: "USDT" },
          ],
        },
        whiteList: {
          create: {
            networkIP,
            deviceName: deviceName || "Primary Device",
          },
        },
      },
      include: {
        whiteList: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
