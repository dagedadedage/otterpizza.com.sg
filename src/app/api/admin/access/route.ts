import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// GET - list all admin users (ADMIN only)
export async function GET(request: NextRequest) {
  const result = await requireRole(request, ["ADMIN"]);
  if ("error" in result) return result.error;

  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("[access] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - add a new admin user (ADMIN only)
export async function POST(request: NextRequest) {
  const result = await requireRole(request, ["ADMIN"]);
  if ("error" in result) return result.error;

  try {
    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "MANAGER"].includes(role || "")) {
      return NextResponse.json(
        { error: "Role must be ADMIN or MANAGER" },
        { status: 400 }
      );
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with that email already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: role || "MANAGER",
        googleId: "manual", // placeholder â€” will be updated on first Google sign-in
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        googleId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[access] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
