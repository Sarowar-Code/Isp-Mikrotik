import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const globalRoutes = [
  "/superadmin/login",
  "/admin/login",
  "/reseller/login",
  "/unauthorized",
  "/",
];

export async function middleware(req: NextRequest) {
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

  let decoded;
  try {
    decoded = jwt.decode(token);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!decoded?.role) return NextResponse.redirect(new URL("/", req.url));

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
