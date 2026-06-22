import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "otter-pizza-admin-2024";

export function checkAdminAuth(request: NextRequest): NextResponse | null {
  const adminKey = request.headers.get("x-admin-key");
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing admin key" },
      { status: 401 }
    );
  }
  return null;
}
