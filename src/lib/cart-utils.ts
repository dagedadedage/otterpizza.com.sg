/** Cart item type — shared between client and server. */
export interface CartItem {
  productId: number;
  sku: string;
  name: string;
  price: number;
  salePrice?: number | null;
  quantity: number;
  imageUrl?: string | null;
}

/** Effective price (sale price if available). */
export function getItemPrice(item: CartItem): number {
  return item.salePrice ?? item.price;
}

/** Subtotal of all items using effective prices. */
export function getSubtotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );
}

/** Total item count. */
export function getItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
