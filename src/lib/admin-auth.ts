import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

/**
 * Check admin authentication via NextAuth session.
 */
export async function checkAdminAuth(request: NextRequest): Promise<NextResponse | null> {
  const user = await getUserFromRequest(request);
  if (user) return null;

  return NextResponse.json(
    { error: "Unauthorized: Invalid or missing admin credentials" },
    { status: 401 }
  );
}
