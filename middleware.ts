import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Get token if user is logged in
  const token = await getToken({ req, secret });

  // --------------------
  // 1. Admin routes
  // --------------------
  
  if (pathname.startsWith("/protected")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // --------------------
  // 2. Auth routes (only for NOT logged-in users)
  // --------------------
  if (pathname.startsWith("/auth")) {
    if (token) {
      return NextResponse.redirect(new URL("/profile", req.url)); // redirect logged-in users
    }
    return NextResponse.next();
  }

  // --------------------
  // 3. Protected routes for any logged-in user
  // --------------------
  const protectedRoutes = ["/profile", "/deposit", "/withdraw"];
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    return NextResponse.next();
  }

  // --------------------
  // 4. All other routes
  // --------------------
  return NextResponse.next();
}

// Define matcher routes
export const config = {
  matcher: [
    "/protected/admin/:path*",
    "/auth/:path*",
    "/profile/:path*",
    "/deposit/:path*",
    "/withdraw/:path*",
  ],
};
