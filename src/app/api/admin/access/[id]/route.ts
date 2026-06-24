import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// PUT - update admin user (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(request, ["ADMIN"]);
  if ("error" in result) return result.error;

  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();

    const user = await prisma.adminUser.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent modifying own role
    if (userId === result.user.userId && body.role && body.role !== user.role) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.email !== undefined) updateData.email = body.email.toLowerCase().trim();
    if (body.role !== undefined) {
      if (!["ADMIN", "MANAGER"].includes(body.role)) {
        return NextResponse.json(
          { error: "Role must be ADMIN or MANAGER" },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }
    if (body.isActive !== undefined) {
      // Prevent deactivating self
      if (userId === result.user.userId && !body.isActive) {
        return NextResponse.json(
          { error: "You cannot deactivate your own account" },
          { status: 400 }
        );
      }
      updateData.isActive = body.isActive;
    }

    const updated = await prisma.adminUser.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        googleId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[access] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - delete admin user (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(request, ["ADMIN"]);
  if ("error" in result) return result.error;

  try {
    const { id } = await params;
    const userId = parseInt(id);

    // Prevent deleting self
    if (userId === result.user.userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await prisma.adminUser.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[access] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
