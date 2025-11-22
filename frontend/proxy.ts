import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const globalRoutes = [
  "/superadmin/login",
  "/admin/login",
  "/reseller/login",
  "/unauthorized",
  "/",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isGlobal =
    pathname === "/" ||
    globalRoutes
      .filter((route) => route !== "/")
      .some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isGlobal) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;
  if (!token) return NextResponse.redirect(new URL("/", req.url));

  let decoded: any;
  try {
    // Note: Using jwt.decode for now, but consider using jwt.verify with secret for production
    decoded = jwt.decode(token);

    // Basic token validation
    if (!decoded || typeof decoded !== "object") {
      throw new Error("Invalid token structure");
    }

    // Check token expiration if present
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      throw new Error("Token expired");
    }
  } catch (error) {
    console.warn("Token validation failed:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!decoded?.role) {
    console.warn("Token missing role claim");
    return NextResponse.redirect(new URL("/", req.url));
  }

  const roleRoutes = {
    superadmin: "/superadmin",
    admin: "/admin",
    reseller: "/reseller",
  };

  const expectedPrefix = roleRoutes[decoded.role];

  if (!pathname.startsWith(expectedPrefix)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*", "/admin/:path*", "/reseller/:path*"],
};
