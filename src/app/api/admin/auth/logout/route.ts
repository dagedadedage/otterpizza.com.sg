import { NextResponse } from "next/server";

const AUTH_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "otter-admin-token",
];

export async function GET() {
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`
    : "/admin/login";

  const headers = new Headers();
  headers.set("Location", redirectUrl);

  for (const name of AUTH_COOKIES) {
    headers.append("Set-Cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`);
    headers.append("Set-Cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  }

  return new Response(null, { status: 302, headers });
}
