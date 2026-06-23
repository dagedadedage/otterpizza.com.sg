import { createHmac } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_SECRET = process.env.AUTH_SECRET || "otter-pizza-dev-secret-change-in-production";
const COOKIE_NAME = "otter-admin-token";
const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours

export interface AdminUserPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf-8");
}

export function signToken(payload: AdminUserPayload): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(
    JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + TOKEN_EXPIRY_MS })
  );
  const signature = createHmac("sha256", AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): AdminUserPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, bodyB64, signatureB64] = parts;
    const expectedSig = createHmac("sha256", AUTH_SECRET)
      .update(`${headerB64}.${bodyB64}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    if (signatureB64 !== expectedSig) return null;

    const body = JSON.parse(base64UrlDecode(bodyB64));

    if (body.exp && Date.now() > body.exp) return null;

    return {
      userId: body.userId,
      email: body.email,
      name: body.name,
      role: body.role,
    };
  } catch {
    return null;
  }
}

/** Read user from request cookie. Returns null if not authenticated. */
export function getUserFromRequest(request: NextRequest): AdminUserPayload | null {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** API route helper: returns user or sends 401 response. */
export function requireAuth(
  request: NextRequest
): { user: AdminUserPayload } | { error: NextResponse } {
  const user = getUserFromRequest(request);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}

/** API route helper: requires a specific role. */
export function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): { user: AdminUserPayload } | { error: NextResponse } {
  const result = requireAuth(request);
  if ("error" in result) return result;

  if (!allowedRoles.includes(result.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}

const IS_SECURE =
  (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://");

/** Set the auth cookie on a response. */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_EXPIRY_MS / 1000,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: IS_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
