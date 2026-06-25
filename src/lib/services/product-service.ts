import { prisma } from "@/lib/prisma";

export class ProductService {
  static async listProducts(filters: {
    categoryId?: number;
    inStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { categoryId, inStock, search, page = 1, limit = 50 } = filters;
    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (inStock !== undefined) where.inStock = inStock;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as any,
        include: { category: true },
        orderBy: { sku: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where: where as any }),
    ]);
    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getProduct(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  static async getProductBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
  }

  static async createProduct(data: {
    sku: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    salePrice?: number;
    imageUrl?: string;
    categoryId: number;
    inStock?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    sortOrder?: number;
  }) {
    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : null,
        imageUrl: data.imageUrl || null,
        categoryId: data.categoryId,
        inStock: data.inStock ?? true,
        isFeatured: data.isFeatured ?? false,
        tags: data.tags ? JSON.stringify(data.tags) : "",
        sortOrder: data.sortOrder ?? 0,
      },
      include: { category: true },
    });
    return product;
  }

  static async updateProduct(
    id: number,
    data: {
      sku?: string;
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      salePrice?: number | null;
      imageUrl?: string | null;
      categoryId?: number;
      inStock?: boolean;
      isFeatured?: boolean;
      tags?: string[];
      sortOrder?: number;
    }
  ) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new Error("Product not found");

    const updateData: Record<string, unknown> = {};
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.salePrice !== undefined)
      updateData.salePrice = data.salePrice !== null ? Number(data.salePrice) : null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.inStock !== undefined) updateData.inStock = data.inStock;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    // Track price changes
    if (data.price !== undefined || data.salePrice !== undefined) {
      await prisma.priceHistory.create({
        data: {
          productId: id,
          oldPrice: existing.price,
          newPrice: data.price !== undefined ? Number(data.price) : existing.price,
          oldSalePrice: existing.salePrice,
          newSalePrice:
            data.salePrice !== undefined
              ? data.salePrice !== null
                ? Number(data.salePrice)
                : null
              : existing.salePrice,
          changedBy: 0, // Default admin ID, can be overridden
        },
      });
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  static async toggleStock(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Product not found");
    return prisma.product.update({
      where: { id },
      data: { inStock: !product.inStock },
      include: { category: true },
    });
  }

  static async deleteProduct(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Product not found");

    // Find or create Obsolete category
    let obsoleteCategory = await prisma.category.findFirst({
      where: { slug: "obsolete" },
    });
    if (!obsoleteCategory) {
      obsoleteCategory = await prisma.category.create({
        data: {
          name: "Obsolete",
          slug: "obsolete",
          sortOrder: 9999,
        },
      });
    }

    // Soft delete: move to obsolete, hide from public, preserve order history
    return prisma.product.update({
      where: { id },
      data: {
        inStock: false,
        isFeatured: false,
        sortOrder: 9999,
        categoryId: obsoleteCategory.id,
      },
    });
  }

  static async bulkUpdatePrice(
    ids: number[],
    adjustmentType: "fixed" | "percentage",
    adjustmentValue: number
  ) {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
    });

    const updates = products.map((product) => {
      let newPrice: number;
      if (adjustmentType === "fixed") {
        newPrice = Number(product.price) + adjustmentValue;
      } else {
        newPrice = Number(product.price) * (1 + adjustmentValue / 100);
      }
      newPrice = Math.round(newPrice * 100) / 100;

      return prisma.product.update({
        where: { id: product.id },
        data: { price: newPrice },
      });
    });

    await Promise.all(updates);

    // Record price history
    await Promise.all(
      products.map((product) => {
        let newPrice: number;
        if (adjustmentType === "fixed") {
          newPrice = Number(product.price) + adjustmentValue;
        } else {
          newPrice = Number(product.price) * (1 + adjustmentValue / 100);
        }
        newPrice = Math.round(newPrice * 100) / 100;

        return prisma.priceHistory.create({
          data: {
            productId: product.id,
            oldPrice: product.price,
            newPrice,
            changedBy: 0,
          },
        });
      })
    );

    return { updated: products.length };
  }

  static async getCategories() {
    return prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async createCategory(data: {
    name: string;
    slug: string;
    sortOrder?: number;
  }) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  static async updateCategory(
    id: number,
    data: { name?: string; slug?: string; sortOrder?: number }
  ) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: number) {
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new Error(
        `Cannot delete category: ${productCount} product(s) are assigned to it`
      );
    }
    return prisma.category.delete({ where: { id } });
  }
}
