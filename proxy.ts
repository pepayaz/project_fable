import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const protectedPrefixes = [
  "/dashboard",
  "/insights",
  "/staff",
  "/departments",
  "/tasks",
  "/attendance",
  "/availability",
  "/performance-notes",
  "/audit-logs",
  "/my",
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
    "/insights/:path*",
    "/staff/:path*",
    "/departments/:path*",
    "/tasks/:path*",
    "/attendance/:path*",
    "/availability/:path*",
    "/performance-notes/:path*",
    "/audit-logs/:path*",
    "/my/:path*",
    "/settings/:path*",
  ],
};
