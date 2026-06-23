import { prisma } from "@/lib/prisma";

export class OrderService {
  // List orders with filtering and pagination
  static async listOrders(filters: {
    status?: string;
    storeId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, storeId, search, page = 1, limit = 20 } = filters;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (storeId) where.storeId = storeId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: where as any,
        include: {
          items: { include: { product: true } },
          store: true,
          statusLogs: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: where as any }),
    ]);
    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getOrder(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        store: true,
        statusLogs: { orderBy: { createdAt: "desc" } },
        adminNotes: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  static async updateStatus(
    orderId: number,
    toStatus: string,
    changedBy: number,
    note?: string
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    await prisma.order.update({
      where: { id: orderId },
      data: { status: toStatus },
    });
    await prisma.orderStatusLog.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus,
        changedBy,
        note: note || null,
      },
    });
    return order;
  }

  static async addNote(orderId: number, content: string, createdBy: number) {
    return prisma.orderNote.create({
      data: { orderId, content, createdBy },
    });
  }

  static async updateTrackingUrl(orderId: number, url: string | null) {
    return prisma.order.update({
      where: { id: orderId },
      data: { deliveryTrackingUrl: url },
    });
  }

  static async getStats() {
    const [
      total,
      pending,
      confirmed,
      preparing,
      ready,
      completed,
      cancelled,
      todayOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.order.count({ where: { status: "PREPARING" } }),
      prisma.order.count({ where: { status: "READY" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const todayRevenueResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["COMPLETED", "READY", "CONFIRMED"] },
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return {
      totalOrders: total,
      pendingOrders: pending,
      confirmedOrders: confirmed,
      preparingOrders: preparing,
      readyOrders: ready,
      completedOrders: completed,
      cancelledOrders: cancelled,
      todayOrders,
      todayRevenue: Number(todayRevenueResult._sum.total || 0),
    };
  }
}
