import { NextResponse } from "next/server";

const AUTH_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "otter-admin-token",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
];

export async function GET() {
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`
    : "/admin/login";

  // Use a standard Response so we can set multiple Set-Cookie headers properly
  const response = NextResponse.redirect(redirectUrl);

  // Clear all auth cookies (both secure and non-secure variants)
  for (const name of AUTH_COOKIES) {
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
    );
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`
    );
  }

  return response;
}
