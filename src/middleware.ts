import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "otter-admin-token";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "otter-pizza-admin-2024";

// Paths that don't require authentication
const PUBLIC_PATHS = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public paths (login page, auth API)
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/api/admin/auth/")
  ) {
    return NextResponse.next();
  }

  // For API routes: check cookie or x-admin-key header
  if (pathname.startsWith("/api/admin")) {
    const hasCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (hasCookie) {
      // Quick structural check: JWT has 3 parts
      if (hasCookie.split(".").length === 3) {
        return NextResponse.next();
      }
    }
    // Fall back to x-admin-key for backward compatibility
    if (request.headers.get("x-admin-key") === ADMIN_SECRET) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For page routes: cookie required, redirect to login if missing
  if (!request.cookies.get(COOKIE_NAME)?.value) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
