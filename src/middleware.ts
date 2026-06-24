import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// NextAuth's default session cookie names
const COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "otter-admin-token", // legacy
];

function getAuthCookie(request: NextRequest): string | undefined {
  for (const name of COOKIE_NAMES) {
    const val = request.cookies.get(name)?.value;
    if (val) return val;
  }
  return undefined;
}

// Paths that don't require authentication
const PUBLIC_PATHS = ["/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public paths: login page, auth API
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/admin/auth/")
  ) {
    return NextResponse.next();
  }

  // For API routes: check cookie
  if (pathname.startsWith("/api/admin")) {
    const hasCookie = getAuthCookie(request);
    if (hasCookie) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For page routes: check session via NextAuth
  const session = await auth();
  if (session?.user) {
    return NextResponse.next();
  }

  // Fallback: check for raw cookie (works even if auth() fails)
  if (getAuthCookie(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
