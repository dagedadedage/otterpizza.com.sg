import type { Prisma } from "@prisma/client";

// Product with category
export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

// Category with products
export type CategoryWithProducts = Prisma.CategoryGetPayload<{
  include: { products: true };
}>;

// Order with relations
export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    store: true;
    statusLogs: true;
    adminNotes: true;
  };
}>;

// Order with items
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    store: true;
  };
}>;

// Store type
export type Store = Prisma.StoreGetPayload<{}>;

// Promotion type
export type Promotion = Prisma.PromotionGetPayload<{}>;

// Order filters
export interface OrderFilters {
  status?: string;
  storeId?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Checkout input
export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  storeId: number;
  notes?: string;
  items: CheckoutItem[];
}

export interface CheckoutItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Contact form input
export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

// Order stats
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  todayRevenue: number;
  todayOrders: number;
}

// Product admin filters
export interface ProductFilters {
  categoryId?: number;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Create product input
export interface CreateProductInput {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  categoryId: number;
  tags?: string[];
  imageUrl?: string;
  inStock?: boolean;
  sortOrder?: number;
}

// Update product input
export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: number;
}

// Create category input
export interface CreateCategoryInput {
  name: string;
  slug: string;
  sortOrder?: number;
}

// Update category input
export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  sortOrder?: number;
}
