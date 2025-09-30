import { NextRequest, NextResponse } from "next/server";

// Only protect dashboard and other private pages, NOT login pages
const protectedRoutes = [
  "/superadmin/dashboard",
  "/admin/dashboard",
  "/reseller/dashboard",
  // add more protected subroutes if needed
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for auth cookie (adjust cookie name as per your backend)
  const token = request.cookies.get("token")?.value;

  if (!token) {
    // Redirect to the correct login page based on role
    let loginUrl = "/login";
    if (pathname.startsWith("/superadmin")) loginUrl = "/superadmin/login";
    else if (pathname.startsWith("/admin")) loginUrl = "/admin/login";
    else if (pathname.startsWith("/reseller")) loginUrl = "/reseller/login";

    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  return NextResponse.next();
}

// Configure matcher for protected dashboard routes only
export const config = {
  matcher: [
    "/superadmin/dashboard/:path*",
    "/admin/dashboard/:path*",
    "/reseller/dashboard/:path*",
    // add more if you have other protected subroutes
  ],
};
