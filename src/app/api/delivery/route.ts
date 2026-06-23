import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.deliverySetting.findFirst();
    return NextResponse.json({ fee: setting?.fee ?? 5 });
  } catch {
    return NextResponse.json({ fee: 5 });
  }
}
