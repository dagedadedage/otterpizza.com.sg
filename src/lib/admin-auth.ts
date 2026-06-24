import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

/**
 * Check admin authentication via JWT session cookie.
 * Middleware handles the basic cookie check; this provides
 * a second verification that the token is valid.
 */
export function checkAdminAuth(request: NextRequest): NextResponse | null {
  const user = getUserFromRequest(request);
  if (user) return null;

  return NextResponse.json(
    { error: "Unauthorized: Invalid or missing admin credentials" },
    { status: 401 }
  );
}
