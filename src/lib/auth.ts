import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// All known auth cookie names (NextAuth native + legacy)
const AUTH_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "otter-admin-token",
];

export interface AdminUserPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

/** Read user from request using NextAuth's auth(). Returns null if not authenticated. */
export async function getUserFromRequest(
  request: NextRequest
): Promise<AdminUserPayload | null> {
  // Check for any auth cookie as a quick pre-filter
  const hasCookie = AUTH_COOKIE_NAMES.some(
    (name) => request.cookies.get(name)?.value
  );
  if (!hasCookie) return null;

  try {
    const session = await auth();
    if (session?.user?.email) {
      return {
        userId: Number(session.user.id) || 0,
        email: session.user.email,
        name: session.user.name || "",
        role: (session.user as Record<string, unknown>).role as string || "MANAGER",
      };
    }
  } catch {
    // auth() failed — fall through
  }
  return null;
}

/** API route helper: returns user or sends 401 response. */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AdminUserPayload } | { error: NextResponse }> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}

/** API route helper: requires a specific role. */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ user: AdminUserPayload } | { error: NextResponse }> {
  const result = await requireAuth(request);
  if ("error" in result) return result;

  if (!allowedRoles.includes(result.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}
