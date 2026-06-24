import { prisma } from "@/lib/prisma";
import { geocodeAddress, buildSearchAddress } from "@/lib/geocode";

export class StoreService {
  static async listStores(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return prisma.store.findMany({
      where: where as any,
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getStore(id: number) {
    return prisma.store.findUnique({ where: { id } });
  }

  static async createStore(data: {
    name: string;
    address: string;
    unit: string;
    building: string;
    postalCode: string;
    grabUrl?: string;
    foodpandaUrl?: string;
    deliverooUrl?: string;
    latitude?: number;
    longitude?: number;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    // Auto-geocode if no coordinates provided
    let lat = data.latitude ? Number(data.latitude) : null;
    let lng = data.longitude ? Number(data.longitude) : null;

    if (!lat || !lng) {
      const search = buildSearchAddress(data.address, data.unit, data.building, data.postalCode);
      const geo = await geocodeAddress(search);
      if (geo) {
        lat = geo.latitude;
        lng = geo.longitude;
      }
    }

    return prisma.store.create({
      data: {
        name: data.name,
        address: data.address,
        unit: data.unit,
        building: data.building,
        postalCode: data.postalCode,
        grabUrl: data.grabUrl || null,
        foodpandaUrl: data.foodpandaUrl || null,
        deliverooUrl: data.deliverooUrl || null,
        latitude: lat,
        longitude: lng,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  static async updateStore(
    id: number,
    data: {
      name?: string;
      address?: string;
      unit?: string;
      building?: string;
      postalCode?: string;
      grabUrl?: string | null;
      foodpandaUrl?: string | null;
      deliverooUrl?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) throw new Error("Store not found");

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.building !== undefined) updateData.building = data.building;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.grabUrl !== undefined) updateData.grabUrl = data.grabUrl;
    if (data.foodpandaUrl !== undefined)
      updateData.foodpandaUrl = data.foodpandaUrl;
    if (data.deliverooUrl !== undefined)
      updateData.deliverooUrl = data.deliverooUrl;
    if (data.latitude !== undefined)
      updateData.latitude = data.latitude !== null ? Number(data.latitude) : null;
    if (data.longitude !== undefined)
      updateData.longitude =
        data.longitude !== null ? Number(data.longitude) : null;

    // Auto-geocode if address changed and no coordinates provided
    const addressChanged = data.address || data.unit || data.building || data.postalCode;
    if (addressChanged && !data.latitude && !data.longitude) {
      const addr = data.address || existing.address;
      const unit = data.unit || existing.unit;
      const bldg = data.building || existing.building;
      const pc = data.postalCode || existing.postalCode;
      const search = buildSearchAddress(addr, unit, bldg, pc);
      const geo = await geocodeAddress(search);
      if (geo) {
        updateData.latitude = geo.latitude;
        updateData.longitude = geo.longitude;
      }
    }

    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    return prisma.store.update({
      where: { id },
      data: updateData,
    });
  }

  static async deactivateStore(id: number) {
    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) throw new Error("Store not found");
    return prisma.store.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async deleteStore(id: number) {
    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) throw new Error("Store not found");

    const orderCount = await prisma.order.count({
      where: { storeId: id },
    });
    if (orderCount > 0) {
      // Soft delete by deactivating
      return prisma.store.update({
        where: { id },
        data: { isActive: false },
      });
    }
    return prisma.store.delete({ where: { id } });
  }
}
