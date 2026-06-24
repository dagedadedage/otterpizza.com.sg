import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    let setting = await prisma.deliverySetting.findFirst();
    if (!setting) {
      setting = await prisma.deliverySetting.create({ data: { fee: 5 } });
    }
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await checkAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    if (typeof body.fee !== "number" || body.fee < 0) {
      return NextResponse.json({ error: "Fee must be a positive number" }, { status: 400 });
    }

    let setting = await prisma.deliverySetting.findFirst();
    if (!setting) {
      setting = await prisma.deliverySetting.create({ data: { fee: body.fee } });
    } else {
      setting = await prisma.deliverySetting.update({ where: { id: setting.id }, data: { fee: body.fee } });
    }
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
