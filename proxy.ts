import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const protectedPrefixes = [
  "/dashboard",
  "/staff",
  "/departments",
  "/tasks",
  "/attendance",
  "/availability",
  "/performance-notes",
  "/settings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/staff/:path*",
    "/departments/:path*",
    "/tasks/:path*",
    "/attendance/:path*",
    "/availability/:path*",
    "/performance-notes/:path*",
    "/settings/:path*",
  ],
};
