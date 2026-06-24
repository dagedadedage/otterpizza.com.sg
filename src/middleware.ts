import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NextAuth session cookie names (native + legacy)
const AUTH_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "otter-admin-token",
];

function hasAuthCookie(request: NextRequest): boolean {
  return AUTH_COOKIES.some((name) => request.cookies.get(name)?.value);
}

const PUBLIC_PATHS = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public paths and auth API routes
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/admin/auth/")
  ) {
    return NextResponse.next();
  }

  // API routes: require any auth cookie
  if (pathname.startsWith("/api/admin")) {
    if (hasAuthCookie(request)) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Page routes: require any auth cookie, redirect to login if missing
  if (!hasAuthCookie(request)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
