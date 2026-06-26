import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proxy OneMap API to avoid CORS issues
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Invalid postal code" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://developers.onemap.sg/commonapi/search?searchVal=${code}&returnGeom=N&getAddrDetails=Y`,
      { headers: { "User-Agent": "OtterPizza/1.0" } }
    );
    if (!res.ok) throw new Error(`OneMap returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("[postal] OneMap lookup failed:", e);
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
