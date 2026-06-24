import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/admin-auth";

// GET - fetch GST settings (create default if none exists)
export async function GET(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    let gst = await prisma.gstSetting.findFirst();
    if (!gst) {
      gst = await prisma.gstSetting.create({
        data: { rate: 9, mode: "EXCLUSIVE" },
      });
    }
    return NextResponse.json(gst);
  } catch (error) {
    console.error("[gst] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GST settings" },
      { status: 500 }
    );
  }
}

// PUT - update GST settings
export async function PUT(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    if (body.rate !== undefined && (typeof body.rate !== "number" || body.rate < 0 || body.rate > 100)) {
      return NextResponse.json(
        { error: "GST rate must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    if (body.mode && !["INCLUSIVE", "EXCLUSIVE"].includes(body.mode)) {
      return NextResponse.json(
        { error: "GST mode must be INCLUSIVE or EXCLUSIVE" },
        { status: 400 }
      );
    }

    let gst = await prisma.gstSetting.findFirst();
    if (!gst) {
      gst = await prisma.gstSetting.create({
        data: {
          rate: body.rate ?? 9,
          mode: body.mode ?? "EXCLUSIVE",
        },
      });
    } else {
      const updateData: Record<string, unknown> = {};
      if (body.rate !== undefined) updateData.rate = body.rate;
      if (body.mode !== undefined) updateData.mode = body.mode;
      gst = await prisma.gstSetting.update({
        where: { id: gst.id },
        data: updateData,
      });
    }

    return NextResponse.json(gst);
  } catch (error) {
    console.error("[gst] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update GST settings" },
      { status: 500 }
    );
  }
}
