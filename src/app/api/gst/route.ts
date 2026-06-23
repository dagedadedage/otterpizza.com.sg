import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gst = await prisma.gstSetting.findFirst();
    return NextResponse.json({
      rate: gst?.rate ?? 9,
      mode: gst?.mode ?? "EXCLUSIVE",
    });
  } catch {
    return NextResponse.json({ rate: 9, mode: "EXCLUSIVE" });
  }
}
