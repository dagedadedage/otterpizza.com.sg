import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "otter-pizza-admin-2024";

/**
 * Check admin authentication.
 * Tries JWT cookie first, then falls back to x-admin-key header.
 */
export function checkAdminAuth(request: NextRequest): NextResponse | null {
  // Try JWT cookie first
  const user = getUserFromRequest(request);
  if (user) return null;

  // Fall back to x-admin-key header
  const adminKey = request.headers.get("x-admin-key");
  if (adminKey === ADMIN_SECRET) return null;

  return NextResponse.json(
    { error: "Unauthorized: Invalid or missing admin credentials" },
    { status: 401 }
  );
}
