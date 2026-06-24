import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAMES = ["otter-admin-token", "__Secure-otter-admin-token"];

function getAuthCookie(request: NextRequest): string | undefined {
  for (const name of COOKIE_NAMES) {
    const val = request.cookies.get(name)?.value;
    if (val) return val;
  }
  return undefined;
}

// Paths that don't require authentication
const PUBLIC_PATHS = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public paths: login page, auth API (NextAuth + legacy)
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
    if (hasCookie && hasCookie.split(".").length === 3) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For page routes: cookie required, redirect to login if missing
  if (!getAuthCookie(request)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
