import { NextResponse } from "next/server";

const AUTH_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "otter-admin-token",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
];

export async function GET() {
  const response = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL || "https://otterpizza.com"));

  // Clear all possible auth cookies
  for (const name of AUTH_COOKIES) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    // Also try without secure for dev
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
  }

  return response;
}
