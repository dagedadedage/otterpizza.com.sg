# 🍕 Otter Pizza — Website Rebuild: Development Plan

**Current site:** https://www.otterpizza.com.sg/ (Wix-hosted)
**Target:** Custom stack rebuild with HitPay payment integration
**AI stack:** Claude (Anthropic) + DeepSeek v4

---

## 1. Current Site Analysis

### 1.1 Architecture (Wix)
| Component | Implementation |
|-----------|---------------|
| Platform | Wix (managed hosting, drag-and-drop) |
| Hosting | Wix CDN (static.wixstatic.com, static.wix.com) |
| Images | AVIF format, Wix media manager |
| E-commerce | Standard Wix Stores module |
| Auth | Wix Members (Login/signup) |
| Menu PDF | External PDF (`/files/ugd/2fd5c9_....pdf`) |
| Contact | Wix Forms |
| Delivery | Grab, Foodpanda, Deliveroo links (no direct integration) |

### 1.2 Page Inventory
1. **Landing Page** (`/`) — Brand logo, 3 CTAs (Order Online, View Menu PDF, Locate Us), copyright footer
2. **Menu Page** (`/menu`) — Grid of 30 items across 5 categories
3. **Online Ordering** (`/category/all-products`) — 31 products with images and prices
4. **Product Detail Page** (`/product-page/{slug}`) — Image, name, price, ingredients, quantity, Add to Cart
5. **Cart/Checkout** — Wix-native cart and checkout flow
6. **Locate Us** (`/locate-us`) — 9 store addresses + contact form + delivery platform links

### 1.3 Product Catalog (31 items)

**Classic 12" ($16.80 each)**
| # | Name | Key Ingredients |
|---|------|----------------|
| 101 | Otter's Hawaiian | Ham, pineapple, mozzarella |
| 102 | Ham & Cheese Special | Ham, cheddar, mozzarella |
| 103 | Pepperoni Classic | Pepperoni, mozzarella |
| 104 | Beef & Pineapple ($22.80) | Beef, pineapple, mozzarella |
| 105 | Cheese Melt | Mixed cheeses, mozzarella |
| 106 | Margherita | Tomato, basil, mozzarella |
| 107 | Veggie Delight | Mixed vegetables, mozzarella |
| 108 | Mushroom Speciality | Mixed mushrooms, mozzarella |

**Premium 12" ($22.80–$25.80)**
| # | Name | Key Ingredients |
|---|------|----------------|
| 201 | Otter's All-In Signature | All toppings |
| 202 | Otter's All-Meat Signature | Mixed meats |
| 203 | Four Cheese | 4-cheese blend |
| 204 | Teriyaki Chicken | Chicken, teriyaki sauce |
| 205 | Flossy BBQ Chicken | Chicken, BBQ sauce |
| 206 | Beef Up | Beef, special sauce |
| 207 | Hawaiian Overload ($25.80) | Extra Hawaiian toppings |
| 208 | Pepperoni Overload ($25.80) | Extra pepperoni |

**Specialty 12" ($22.80–$36.80)**
| # | Name | Key Ingredients |
|---|------|----------------|
| 301 | Cajun Prawn Delight ($25.80) | Prawn, cajun spice |
| 302 | Seafood Favourite | Mixed seafood |
| 303 | Smoked Salmon Special ($25.80) | Smoked salmon |
| 304 | Roti John | Roti John style |
| 305 | Deluxe Pizza Burger | Pizza-burger hybrid |
| 306 | Durian Mango Feast ($28.80, was $36.80) | Durian, mango |

**Sides & Drinks**
| # | Name | Price |
|---|------|-------|
| 401 | Chicken Drumlets 6pcs | $8.80 |
| 402 | Potato Wedges with Dip | $5.80 |
| 403 | Chicken Nuggets | $5.80 |
| 404 | Garlic Bread | $5.80 |
| 501 | Coke | $2.00 |
| 502 | Sprite | $2.00 |
| 503 | 100PLUS | $2.00 |
| 504 | Ice Lemon Tea | $2.00 |
| 505 | Ribena Sparkling | $2.00 |

### 1.4 Promotions
- FREE DELIVERY above $60
- 10% OFF above $200
- 15% OFF above $500

### 1.5 Store Locations (9 outlets)
1. Hougang — 21 Hougang Street 51, #01-15 Hougang Green, S538719
2. Bukit Panjang — 1 Woodlands Road, #01-03 Junction 10, S677899
3. Serangoon — 9 Yio Chu Kang Road, #01-01 Space @ Kovan, S545523
4. Bt Batok West — 4 Bukit Batok Street 41, #01-72 Le Quest, S657991
5. Potong Pasir — 51 Upper Serangoon Road #01-13 Poiz Centre, S347697
6. Pasir Ris — 1 Pasir Ris Central Street 3 #03-K01 White Sands, S518457
7. Buona Vista — 35 Rochester Drive, #01-08 Rochester Mall, S138639
8. Novena — 10 Sinaran Drive, #01-22 Square 2, S307506
9. Bukit Timah — 1 Jalan Anak Bukit, #B1-43 Bukit Timah Plaza, S588996

---

## 2. Rebuild Tech Stack

### 2.1 Recommended Stack: Next.js + PostgreSQL + Prisma

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 (App Router) | SSR for SEO, API routes for backend, React Server Components |
| **Language** | TypeScript 5.x | Type safety across frontend + backend |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Utility-first, accessible component primitives |
| **Database** | PostgreSQL (existing `otter_manpower` or new `otter_pizza` DB) | Already running on localhost |
| **ORM** | Prisma | Type-safe DB access, migrations, seeding |
| **Auth** | NextAuth.js v5 | Customer accounts, admin dashboard auth |
| **Payments** | HitPay REST API | PayNow, cards, GrabPay, ShopeePay |
| **Image Hosting** | Vercel Blob / Cloudinary | Optimized pizza images with AVIF/WebP |
| **Email** | Resend / SendGrid | Order confirmations, receipts |
| **Admin** | Built-in admin dashboard | Menu management, order management |
| **Hosting** | Vercel (frontend + API) | Edge network, CDN, serverless |
| **AI Dev** | Claude (planning, review, complex logic) + DeepSeek v4 (implementation, boilerplate) | Cost-effective AI pair programming |

### 2.2 Why Not Other Stacks?

| Alternative | Why Rejected |
|-------------|--------------|
| Pure React SPA | No SSR — hurts SEO, slower FCP |
| WordPress/WooCommerce | Overkill for 31 SKUs, PHP maintenance burden |
| Remix | Smaller ecosystem, less community than Next.js |
| Django/Laravel | Mismatch with team's JS/TS expertise implied by other projects |
| Strapi/headless CMS | Adds overhead; menu is small enough for DB-driven approach |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Landing  │  │  Menu    │  │  Order   │  │ Locate Us  │ │
│  │  Page    │  │  Page    │  │  Flow    │  │   Page     │ │
│  │ (SSG)    │  │ (ISR)    │  │ (CSR)    │  │ (SSG)      │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes (/api/*)              │  │
│  │  /api/menu  /api/cart  /api/orders  /api/checkout    │  │
│  │  /api/admin/*           /api/webhooks/hitpay         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐    ┌──────────────┐    ┌──────────────┐
   │PostgreSQL│    │  HitPay API  │    │ Image CDN    │
   │(localhost│    │  (sandbox →  │    │ (Cloudinary/ │
   │ or cloud)│    │   production)│    │  Vercel Blob)│
   └──────────┘    └──────────────┘    └──────────────┘
```

### 3.2 Database Schema (Prisma)

```prisma
model Category {
  id        Int       @id @default(autoincrement())
  name      String    // "Classic 12\"", "Premium 12\"", "Specialty 12\"", "Sides", "Drinks"
  slug      String    @unique
  sortOrder Int       @default(0)
  products  Product[]
}

model Product {
  id          Int       @id @default(autoincrement())
  sku         String    @unique  // "101", "201", etc.
  name        String    // "OTTER'S HAWAIIAN 12\""
  slug        String    @unique
  description String?   // ingredients list
  price       Decimal   @db.Decimal(10, 2)
  salePrice   Decimal?  @db.Decimal(10, 2)  // for sale items like #306
  imageUrl    String?
  categoryId  Int
  category    Category  @relation(fields: [categoryId], references: [id])
  inStock     Boolean   @default(true)
  isFeatured  Boolean   @default(false)
  tags        String[]  // ["Signature", "Must-try"]
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  orderItems  OrderItem[]
}

model Store {
  id        Int     @id @default(autoincrement())
  name      String  // "Hougang", "Bukit Panjang", etc.
  address   String
  unit      String  // "#01-15"
  building  String  // "Hougang Green"
  postalCode String  @db.VarChar(6)
  grabUrl   String?
  foodpandaUrl String?
  deliverooUrl String?
  latitude  Float?
  longitude Float?
  isActive  Boolean @default(true)
  sortOrder Int     @default(0)
}

model Order {
  id              Int         @id @default(autoincrement())
  orderNumber     String      @unique  // "OP-2026-0001"
  customerName    String
  customerEmail   String
  customerPhone   String?
  storeId         Int?
  store           Store?      @relation(fields: [storeId], references: [id])
  subtotal        Decimal     @db.Decimal(10, 2)
  discount        Decimal     @default(0) @db.Decimal(10, 2)
  deliveryFee     Decimal     @default(0) @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING)
  paymentMethod   String?     // "paynow_online", "card", etc.
  paymentId       String?     // HitPay payment_request_id
  paymentStatus   String?     // "pending", "completed", "failed", "refunded"
  items           OrderItem[]
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id])
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2)
  totalPrice Decimal @db.Decimal(10, 2)
}

model ContactSubmission {
  id        Int      @id @default(autoincrement())
  firstName String
  lastName  String
  email     String
  message   String
  createdAt DateTime @default(now())
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  DELIVERED
  CANCELLED
}

model Promotion {
  id          Int     @id @default(autoincrement())
  name        String
  description String
  minAmount   Decimal @db.Decimal(10, 2)
  type        PromoType
  value       Decimal @db.Decimal(10, 2)  // percentage or fixed amount
  isActive    Boolean @default(true)
}

enum PromoType {
  FREE_DELIVERY
  PERCENTAGE_DISCOUNT
  FIXED_DISCOUNT
}
```

### 3.3 Route Map (Next.js App Router)

```
/
├── page.tsx                    # Landing page (SSG)
├── menu/
│   └── page.tsx                # Full menu grid with categories (ISR, 60s)
├── menu/[slug]/
│   └── page.tsx                # Product detail page (SSG with generateStaticParams)
├── order/
│   └── page.tsx                # Order page — browse menu + add to cart (CSR)
├── cart/
│   └── page.tsx                # Cart review page (CSR)
├── checkout/
│   └── page.tsx                # Checkout — customer info + delivery (CSR)
├── checkout/success/
│   └── page.tsx                # Payment success confirmation
├── locate-us/
│   └── page.tsx                # Store locator with map (SSG)
├── api/
│   ├── menu/
│   │   └── route.ts            # GET /api/menu — list products
│   ├── menu/[id]/
│   │   └── route.ts            # GET /api/menu/[id] — single product
│   ├── cart/
│   │   └── route.ts            # POST/GET cart operations
│   ├── orders/
│   │   └── route.ts            # POST create order
│   ├── orders/[id]/
│   │   └── route.ts            # GET order status
│   ├── checkout/
│   │   └── route.ts            # POST — create HitPay payment request
│   ├── webhooks/
│   │   └── hitpay/
│   │       └── route.ts        # POST — HitPay webhook handler
│   ├── stores/
│   │   └── route.ts            # GET /api/stores — list locations
│   ├── contact/
│   │   └── route.ts            # POST — contact form submission
│   └── promotions/
│       └── route.ts            # GET — active promotions
├── admin/
│   ├── page.tsx                # Admin dashboard
│   ├── admin/menu/
│   │   └── page.tsx            # Menu CRUD
│   ├── admin/orders/
│   │   └── page.tsx            # Order management
│   ├── admin/promotions/
│   │   └── page.tsx            # Promotion management
│   └── admin/stores/
│       └── page.tsx            # Store management
└── layout.tsx                  # Root layout (nav, footer)
```

---

## 4. HitPay Payment Integration

### 4.1 API Summary

| Item | Detail |
|------|--------|
| **Sandbox** | `https://api.sandbox.hit-pay.com/v1` |
| **Production** | `https://api.hit-pay.com/v1` |
| **Auth** | `X-BUSINESS-API-KEY` header |
| **Content-Type** | `application/x-www-form-urlencoded` |
| **Create Payment** | `POST /v1/payment-requests` |
| **Get Payment** | `GET /v1/payment-requests/:id` |
| **Webhook** | `payment_request.completed`, `charge.created`, `charge.updated` |
| **Webhook Verify** | HMAC-SHA256 via `Hitpay-Signature` header + per-webhook salt |

### 4.2 Singapore Payment Methods
`paynow_online`, `card`, `grabpay_direct`, `grabpay_paylater`, `shopee_pay`, `shopee_pay_later`, `shopback`, `atome`, `atome_qr`, `wechat_pay`, `upi_qr`, `giro`

### 4.3 Checkout Flow

```
Customer Order Flow:
────────────────────────────────────────────────────────────

1. Browse Menu → 2. Add to Cart → 3. Cart Review → 4. Checkout Form
   (name, email, phone, store pickup/delivery, notes)
        │
        ▼
5. POST /api/checkout → Server creates Order (status: PENDING)
   → Server calls HitPay POST /v1/payment-requests
   → Returns { id, url } 
   → Redirect customer to HitPay checkout page (url)
        │
        ▼
6. Customer pays on HitPay hosted page
   (PayNow QR, card form, GrabPay redirect, etc.)
        │
        ▼
7. HitPay redirects back to /checkout/success?payment_request_id=xxx&status=completed
   AND fires webhook POST to /api/webhooks/hitpay
        │
        ▼
8. Webhook handler:
   - Verify HMAC-SHA256 signature
   - Update Order status → CONFIRMED
   - Send confirmation email to customer
   - Send order notification to admin
```

### 4.4 HitPay Integration Code (TypeScript)

```typescript
// lib/hitpay.ts
const HITPAY_API_KEY = process.env.HITPAY_API_KEY!;
const HITPAY_WEBHOOK_SALT = process.env.HITPAY_WEBHOOK_SALT!;
const HITPAY_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.hit-pay.com/v1'
  : 'https://api.sandbox.hit-pay.com/v1';

interface CreatePaymentParams {
  amount: number;
  currency: string; // 'SGD'
  email: string;
  name: string;
  phone?: string;
  referenceNumber: string;
  redirectUrl: string;
  webhookUrl?: string; // deprecated but may still work
  paymentMethods?: string[];
}

interface PaymentRequest {
  id: string;
  name: string | null;
  email: string;
  amount: string;
  currency: string;
  status: string;
  reference_number: string;
  payment_methods: string[];
  url: string;
  redirect_url: string;
  created_at: string;
  updated_at: string;
}

export async function createPaymentRequest(params: CreatePaymentParams): Promise<PaymentRequest> {
  const body = new URLSearchParams({
    amount: params.amount.toFixed(2),
    currency: params.currency,
    email: params.email,
    name: params.name,
    reference_number: params.referenceNumber,
    redirect_url: params.redirectUrl,
    ...(params.phone && { phone: params.phone }),
    ...(params.paymentMethods?.length && { 'payment_methods[]': params.paymentMethods.join(',') }),
  });

  const res = await fetch(`${HITPAY_BASE_URL}/payment-requests`, {
    method: 'POST',
    headers: {
      'X-BUSINESS-API-KEY': HITPAY_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`HitPay API error: ${res.status} ${error}`);
  }

  return res.json();
}

export async function getPaymentStatus(paymentRequestId: string): Promise<PaymentRequest> {
  const res = await fetch(`${HITPAY_BASE_URL}/payment-requests/${paymentRequestId}`, {
    headers: {
      'X-BUSINESS-API-KEY': HITPAY_API_KEY,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  if (!res.ok) {
    throw new Error(`HitPay API error: ${res.status}`);
  }

  return res.json();
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const crypto = require('crypto');
  const computed = crypto
    .createHmac('sha256', HITPAY_WEBHOOK_SALT)
    .update(rawBody)
    .digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}
```

---

## 5. Backend Sub-Systems Architecture

The rebuild is structured around **two primary backend sub-systems** — Order Management and Product Management — plus supporting sub-systems for Stores, Promotions, and Customer Contacts.

### 5.1 Backend Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Next.js API Layer (/api/*)                    │
│                                                                   │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │ ORDER MGMT SUB-SYSTEM   │  │ PRODUCT MGMT SUB-SYSTEM      │  │
│  │                         │  │                              │  │
│  │ /api/admin/orders       │  │ /api/admin/menu              │  │
│  │ /api/orders (customer)  │  │ /api/menu (public)           │  │
│  │ /api/checkout           │  │ /api/admin/categories        │  │
│  │ /api/webhooks/hitpay    │  │ /api/admin/inventory         │  │
│  └───────────┬─────────────┘  └──────────────┬───────────────┘  │
│              │                               │                   │
│  ┌───────────┴─────────────┐  ┌──────────────┴───────────────┐  │
│  │ STORE MGMT SUB-SYSTEM   │  │ PROMOTIONS SUB-SYSTEM        │  │
│  │ /api/admin/stores       │  │ /api/admin/promotions        │  │
│  │ /api/stores (public)    │  │ /api/promotions (public)     │  │
│  └─────────────────────────┘  └──────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              SHARED SERVICES LAYER                        │    │
│  │  OrderService | ProductService | StoreService |           │    │
│  │  PromotionService | EmailService | PaymentService        │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐    ┌──────────────┐    ┌──────────────┐
   │PostgreSQL│    │  HitPay API  │    │ Image CDN    │
   │ Database │    │  (Payments)  │    │ (Cloudinary) │
   └──────────┘    └──────────────┘    └──────────────┘
```

### 5.2 Order Management Sub-System

This is the **core operational backend** — every order from creation to fulfillment is tracked here.

#### 5.2.1 Order Lifecycle

```
Customer Places Order
        │
        ▼
   [PENDING] ───────── Payment fails/timeout ──→ [CANCELLED]
        │
        │ Payment confirmed (HitPay webhook)
        ▼
   [CONFIRMED] ──────── Admin cancels ──────────→ [CANCELLED]
        │
        │ Admin acknowledges / auto after 2min
        ▼
   [PREPARING] ──────── Admin cancels ──────────→ [CANCELLED]
        │
        │ Pizza ready for pickup/delivery
        ▼
   [READY] ─────────── No-show / expired ───────→ [CANCELLED]
        │
        │ Order handed over / delivered
        ▼
   [COMPLETED]
        │
        │ Refund requested
        ▼
   [REFUNDED]
```

#### 5.2.2 Order Management Features (Admin)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Order Dashboard** | Real-time overview: pending, preparing, ready counts. Today's revenue, total orders. | P0 |
| **Order List View** | Filterable table: by status, store, date range, search by order#/customer. Sort by newest/oldest. | P0 |
| **Order Detail View** | Full order: items, quantities, prices, customer info, store, notes, payment details, timeline. | P0 |
| **Status Transitions** | Button-driven workflow: Confirm → Preparing → Ready → Complete. Validation prevents invalid transitions. | P0 |
| **Order Notifications** | Sound + visual alert for new orders. Browser notification API for admin dashboard. | P1 |
| **Bulk Operations** | Multi-select orders to batch-confirm or batch-print. | P1 |
| **Order Search** | Search by order number, customer name, email, or phone. | P1 |
| **Order Notes** | Admin can add internal notes (e.g., "call customer", "extra sauce"). | P1 |
| **Print Receipt** | Thermal-printer-friendly order slip for kitchen. | P2 |
| **Export to CSV** | Export filtered orders for accounting/reconciliation. | P2 |
| **Refund Handling** | Initiate HitPay refund from admin panel. Track refund status. | P2 |
| **Analytics Dashboard** | Sales by store, top products, hourly/daily trends, average order value. | P2 |

#### 5.2.3 Order API Endpoints

```
# Customer-facing
GET    /api/orders/[id]           # Customer views their order status
POST   /api/checkout               # Create order + payment request

# Admin (requires auth)
GET    /api/admin/orders            # List orders (paginated, filterable)
GET    /api/admin/orders/[id]       # Single order detail
PATCH  /api/admin/orders/[id]       # Update order (status, notes)
POST   /api/admin/orders/[id]/refund # Initiate refund
GET    /api/admin/orders/stats      # Dashboard stats (counts, revenue)
GET    /api/admin/orders/export     # CSV export (filtered)

# Webhook (no auth — HMAC verified)
POST   /api/webhooks/hitpay         # HitPay payment status updates
```

#### 5.2.4 OrderService (lib/services/order-service.ts)

```typescript
class OrderService {
  // Create order from cart + customer info
  async createOrder(cart: Cart, customer: CustomerInfo, storeId: number): Promise<Order>
  
  // Status transitions with validation
  async updateStatus(orderId: number, newStatus: OrderStatus, userId: number): Promise<Order>
  
  // Get order with all relations
  async getOrder(orderId: number): Promise<OrderWithRelations>
  
  // List with filters + pagination
  async listOrders(filters: OrderFilters): Promise<PaginatedOrders>
  
  // Dashboard statistics
  async getStats(storeId?: number): Promise<OrderStats>
  
  // Handle HitPay webhook
  async handlePaymentWebhook(payload: HitPayWebhookPayload): Promise<void>
  
  // Process refund
  async refundOrder(orderId: number, amount?: number): Promise<RefundResult>
  
  // Generate order number (OP-2026-0001 format)
  async generateOrderNumber(): Promise<string>
}
```

### 5.3 Product Management Sub-System

This sub-system manages the entire menu catalog — products, categories, pricing, images, and availability.

#### 5.3.1 Product Management Features (Admin)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Product Catalog** | Table/grid view of all products with quick actions. Filter by category, stock status. | P0 |
| **Create Product** | Form: name, SKU, description/ingredients, price, sale price, category, image upload, tags. | P0 |
| **Edit Product** | Modify any product field. Price history tracking. | P0 |
| **Delete/Archive** | Soft-delete products (hide from menu, preserve order history). | P0 |
| **Stock Toggle** | Quick toggle: In Stock / Out of Stock. Used for items like Four Cheese (203). | P0 |
| **Category Management** | Create/edit/delete categories. Set sort order. Assign products to categories. | P0 |
| **Image Management** | Upload, crop, optimize product images. Auto-generate AVIF/WebP variants. | P1 |
| **Bulk Price Update** | Percentage or fixed adjustment across selected products or entire category. | P1 |
| **Featured Products** | Mark/unmark products for homepage/specials section. | P1 |
| **Menu PDF Export** | Generate menu PDF from live product data (replacing static Wix PDF). | P2 |
| **Price History Log** | Track price changes over time with effective dates. | P2 |
| **Product Tags** | Manage tags (Signature, Must-try, New, Sale). Multi-select on product form. | P1 |

#### 5.3.2 Product API Endpoints

```
# Public
GET    /api/menu                    # All products (grouped by category, in-stock only)
GET    /api/menu/[slug]             # Single product detail
GET    /api/menu/categories         # All categories with sort order

# Admin (requires auth)
GET    /api/admin/menu               # All products (including out-of-stock)
POST   /api/admin/menu               # Create new product
PUT    /api/admin/menu/[id]          # Update product
DELETE /api/admin/menu/[id]          # Soft-delete product
PATCH  /api/admin/menu/[id]/stock    # Toggle in-stock status
PATCH  /api/admin/menu/[id]/feature  # Toggle featured status
POST   /api/admin/menu/bulk-price    # Bulk price update
POST   /api/admin/menu/reorder      # Update product sort order

# Categories
GET    /api/admin/categories         # List categories
POST   /api/admin/categories         # Create category
PUT    /api/admin/categories/[id]    # Update category
DELETE /api/admin/categories/[id]    # Delete category (if no products)
POST   /api/admin/categories/reorder # Update category sort order

# Images
POST   /api/admin/menu/[id]/image    # Upload product image
DELETE /api/admin/menu/[id]/image    # Remove product image
```

#### 5.3.3 ProductService (lib/services/product-service.ts)

```typescript
class ProductService {
  // CRUD
  async createProduct(data: CreateProductInput): Promise<Product>
  async updateProduct(id: number, data: UpdateProductInput): Promise<Product>
  async deleteProduct(id: number): Promise<void>  // soft delete
  async getProduct(idOrSlug: number | string): Promise<ProductWithCategory>
  
  // Listing
  async getPublicMenu(): Promise<CategoryWithProducts[]>  // grouped, in-stock only
  async getAdminMenu(filters: ProductFilters): Promise<PaginatedProducts>
  
  // Stock management
  async toggleStock(id: number): Promise<Product>
  async bulkUpdateStock(ids: number[], inStock: boolean): Promise<void>
  
  // Price management
  async updatePrice(id: number, price: number, salePrice?: number): Promise<Product>
  async bulkUpdatePrice(categoryId: number, pctChange: number): Promise<void>
  async getPriceHistory(id: number): Promise<PriceChange[]>
  
  // Features & sorting
  async toggleFeatured(id: number): Promise<Product>
  async updateSortOrder(items: { id: number; sortOrder: number }[]): Promise<void>
  
  // Image handling
  async uploadImage(id: number, file: File): Promise<string>  // returns URL
  async deleteImage(id: number): Promise<void>
  
  // Category management
  async createCategory(data: CreateCategoryInput): Promise<Category>
  async updateCategory(id: number, data: UpdateCategoryInput): Promise<Category>
  async deleteCategory(id: number): Promise<void>
  async updateCategoryOrder(items: { id: number; sortOrder: number }[]): Promise<void>
}
```

### 5.4 Supporting Sub-Systems

#### 5.4.1 Store Management
```
GET    /api/admin/stores            # List all stores
POST   /api/admin/stores            # Add store
PUT    /api/admin/stores/[id]       # Update store (address, delivery links, coords)
DELETE /api/admin/stores/[id]       # Deactivate store
```

#### 5.4.2 Promotion Management
```
GET    /api/admin/promotions        # List promotions
POST   /api/admin/promotions        # Create promotion (type, threshold, value, dates)
PUT    /api/admin/promotions/[id]   # Update promotion
DELETE /api/admin/promotions/[id]   # Deactivate promotion
GET    /api/promotions              # Public: active promotions for cart calculation
```

#### 5.4.3 Contact Submissions
```
GET    /api/admin/contacts          # List contact form submissions (paginated)
GET    /api/admin/contacts/[id]     # View submission detail
DELETE /api/admin/contacts/[id]     # Archive submission
POST   /api/contact                 # Public: submit contact form
```

### 5.5 Shared Service Layer

All sub-systems share a common service layer for cross-cutting concerns:

```typescript
// lib/services/
├── order-service.ts       // Order lifecycle, fulfillment, refund
├── product-service.ts     // Menu CRUD, inventory, pricing
├── store-service.ts       // Location management
├── promotion-service.ts   // Discount rules engine
├── payment-service.ts     // HitPay abstraction (create, verify, refund)
├── email-service.ts       // Templated emails (confirmation, receipt, refund)
├── notification-service.ts // Admin notifications (new order, low stock)
└── export-service.ts      // CSV/pdf generation for reports
```

### 5.6 Enhanced Database Schema (Additions)

```prisma
// Add to existing schema:

model PriceHistory {
  id        Int      @id @default(autoincrement())
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  oldPrice  Decimal  @db.Decimal(10, 2)
  newPrice  Decimal  @db.Decimal(10, 2)
  oldSalePrice Decimal? @db.Decimal(10, 2)
  newSalePrice Decimal? @db.Decimal(10, 2)
  changedBy Int      // admin user ID
  changedAt DateTime @default(now())
}

model OrderStatusLog {
  id        Int         @id @default(autoincrement())
  orderId   Int
  order     Order       @relation(fields: [orderId], references: [id])
  fromStatus OrderStatus?
  toStatus  OrderStatus
  changedBy Int         // admin user ID or 0 for system
  note      String?
  createdAt DateTime    @default(now())
}

model OrderNote {
  id        Int      @id @default(autoincrement())
  orderId   Int
  order     Order    @relation(fields: [orderId], references: [id])
  content   String
  createdBy Int      // admin user ID
  createdAt DateTime @default(now())
}

model AdminUser {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  passwordHash String
  role      AdminRole @default(STAFF)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

enum AdminRole {
  SUPER_ADMIN  // Full access: all features + manage other admins
  MANAGER      // Menu + orders + promotions. Cannot manage admins.
  STAFF        // View orders + update order status. Read-only menu.
}
```

---

## 6. Component Tree

```
<RootLayout>
  <Navbar>
    <Logo />
    <NavLinks />  {/* Home, Menu, Order, Locate Us */}
    <CartIcon />  {/* with item count badge */}
    <MobileMenu />
  </Navbar>
  
  <main>
    {/* Landing Page */}
    <HomePage>
      <HeroSection>
        <BrandLogo />
        <CTAButtons />  {/* Order Online, View Menu PDF, Locate Us */}
      </HeroSection>
      <FeaturedProducts />  {/* optional carousel */}
      <PromoBanner />
    </HomePage>

    {/* Menu Page */}
    <MenuPage>
      <CategoryTabs />  {/* Classic, Premium, Specialty, Sides, Drinks */}
      <ProductGrid>
        <ProductCard>
          <ProductImage />
          <ProductName />
          <Price />
          <Tags />  {/* Signature, Must-try, Sale */}
          <AddToCartButton />
        </ProductCard>
      </ProductGrid>
    </MenuPage>

    {/* Product Detail */}
    <ProductDetailPage>
      <ProductImage />
      <ProductInfo>
        <Name />
        <Price />  {/* with sale price if applicable */}
        <Description />  {/* ingredients */}
        <QuantitySelector />
        <AddToCartButton />
      </ProductInfo>
    </ProductDetailPage>

    {/* Cart */}
    <CartPage>
      <CartItemList>
        <CartItem>
          <ProductThumb />
          <Name />
          <QuantityAdjuster />
          <ItemTotal />
          <RemoveButton />
        </CartItem>
      </CartItemList>
      <CartSummary>
        <Subtotal />
        <PromoDiscount />
        <DeliveryFee />
        <Total />
        <CheckoutButton />
      </CartSummary>
    </CartPage>

    {/* Checkout */}
    <CheckoutPage>
      <CustomerInfoForm />
      <StoreSelector />  {/* pickup location */}
      <OrderSummary />
      <PayNowButton />
    </CheckoutPage>

    {/* Locate Us */}
    <LocateUsPage>
      <StoreList>
        <StoreCard>
          <StoreName />
          <Address />
          <DeliveryLinks />  {/* Grab, Foodpanda, Deliveroo */}
        </StoreCard>
      </StoreList>
      <StoreMap />  {/* Google Maps or Leaflet */}
      <ContactForm />
    </LocateUsPage>
  </main>

  <Footer>
    <Copyright />
    <SocialLinks />
  </Footer>
</RootLayout>
```

---

## 6. Development Phases & Schedule

### Phase 1: Foundation (Days 1–4) — "Scaffold & Data"

| Day | Tasks | AI Role |
|-----|-------|---------|
| **Day 1** | Initialize Next.js 15 project with TypeScript, Tailwind, shadcn/ui, Prisma. Set up PostgreSQL database `otter_pizza`. Configure ESLint, Prettier. | Claude: architecture review. DeepSeek: boilerplate generation. |
| **Day 2** | Design and implement Prisma schema. Write seed script with all 31 products, 9 stores, 3 promotions. Create category data. Run migrations. | DeepSeek: schema + seed code. Claude: review schema normalization. |
| **Day 3** | Build layout shell: Navbar (responsive, mobile menu), Footer, global styles, brand colors/typography. Set up NextAuth.js skeleton. | DeepSeek: component generation. Claude: design review, color system. |
| **Day 4** | Set up image pipeline (Cloudinary or Vercel Blob). Download and migrate all product images from Wix CDN. Build image optimization utilities. | DeepSeek: scripting. Claude: review image strategy. |

**Milestone:** Project runs locally with seeded DB, nav/footer, all images loading.

### Phase 2: Public Pages (Days 5–8) — "Browse & Discover"

| Day | Tasks | AI Role |
|-----|-------|---------|
| **Day 5** | Landing page: Hero section with brand logo + CTAs, promo banner, featured products section. Server-side rendered at build time. | DeepSeek: page components. Claude: design review, accessibility. |
| **Day 6** | Menu page: Category tabs, product grid, product cards with images/prices/tags. Implement ISR for menu data. Add search/filter. | DeepSeek: grid + card components. Claude: UX review. |
| **Day 7** | Product detail page: Full image, name, description/ingredients, price display (with sale handling), quantity selector. SSG with generateStaticParams. | DeepSeek: detail page. Claude: data flow review. |
| **Day 8** | Locate Us page: Store cards with addresses, Google Maps embed, delivery platform links (Grab/Foodpanda/Deliveroo). Contact form with server action. | DeepSeek: map + form. Claude: form validation review. |

**Milestone:** All public pages functional, responsive, and populated with real data.

### Phase 3: Cart & Checkout (Days 9–13) — "Order Flow"

| Day | Tasks | AI Role |
|-----|-------|---------|
| **Day 9** | Cart state management (Zustand or Jotai). Add-to-cart from menu and product pages. Cart icon with badge in navbar. Cart page with item list, quantity adjust, remove. | DeepSeek: cart store + pages. Claude: state management review. |
| **Day 10** | Cart calculations: subtotal, promo logic (FREE DELIVERY ≥$60, 10% OFF ≥$200, 15% OFF ≥$500), delivery fee display. Promo code system. | DeepSeek: calculation logic. Claude: edge case testing. |
| **Day 11** | Checkout page: Customer info form (name, email, phone), store selector for pickup, order notes. Form validation with Zod. | DeepSeek: form components. Claude: validation schema review. |
| **Day 12** | HitPay integration: Create payment request endpoint, redirect to HitPay checkout, success/cancel callback pages. Sandbox testing with test credentials. | Claude: payment flow architecture. DeepSeek: API route implementation. |
| **Day 13** | Webhook handler: HMAC signature verification, order status update, confirmation email (Resend/SendGrid). Error handling + retry logic. | Claude: security review of webhook. DeepSeek: handler code. |

**Milestone:** Complete order flow working end-to-end in sandbox. Can place test order → pay via HitPay sandbox → order confirmed.

### Phase 4: Backend Sub-Systems & Admin Dashboard (Days 14–18) — "Operations"

This phase builds both backend service layers and admin-facing UIs for the Order Management and Product Management sub-systems.

| Day | Tasks | AI Role |
|-----|-------|---------|
| **Day 14** | Admin auth (NextAuth with credentials + Google OAuth). Admin middleware for route protection. AdminUser model + seed (create super admin). Admin layout shell (sidebar nav, header). | DeepSeek: auth scaffolding, layout components. Claude: auth security review, role-based access control design. |
| **Day 15** | **Product Mgmt Sub-System — Backend**: ProductService (CRUD, stock toggle, price update, featured toggle), CategoryService (CRUD + reorder). All `/api/admin/menu/*` and `/api/admin/categories/*` endpoints. Image upload endpoint with Cloudinary integration. | DeepSeek: service + route implementation. Claude: data validation review, error handling patterns. |
| **Day 16** | **Product Mgmt Sub-System — Admin UI**: Product list table (sortable, filterable), product create/edit form (with image upload preview, category dropdown, tag multi-select, sale price). Stock toggle quick action. Category management page. Bulk price update tool. | DeepSeek: form + table components. Claude: UX review, form validation completeness. |
| **Day 17** | **Order Mgmt Sub-System — Backend**: OrderService (create, status transitions with validation, OrderStatusLog, OrderNote). All `/api/admin/orders/*` endpoints. Dashboard stats endpoint. Refund initiation via HitPay. Email notifications on status change. | Claude: order state machine design, webhook idempotency. DeepSeek: service + route implementation. |
| **Day 18** | **Order Mgmt Sub-System — Admin UI**: Order dashboard (stats cards, real-time order feed). Order list (filter by status/store/date, search). Order detail (items, customer, payment, timeline, status transitions, admin notes). New order notification (sound + visual badge). Print-ready order slip. | DeepSeek: dashboard + detail components. Claude: UX workflow review, notification system design. |

**Milestone:** Full admin capability — menu CRUD, order fulfillment workflow, promotion management, contact inbox. Both backend sub-systems operational.

### Phase 5: Polish & Launch (Days 19–23) — "Ship It"

| Day | Tasks | AI Role |
|-----|-------|---------|
| **Day 19** | Responsive design audit: Mobile, tablet, desktop. Fix all layout issues. Accessibility pass (keyboard nav, screen reader, color contrast). Admin UI responsive on tablet (for in-store use). | Claude: comprehensive design/accessibility review. DeepSeek: implementation of fixes. |
| **Day 20** | Performance optimization: Lighthouse audit, image optimization (AVIF/WebP, lazy loading), Core Web Vitals, bundle analysis. API response time optimization (Prisma query tuning). | Claude: performance analysis. DeepSeek: optimization implementation. |
| **Day 21** | SEO: Metadata, Open Graph, structured data (Product, LocalBusiness, Organization schema), sitemap.xml, robots.txt. Analytics setup (Vercel Analytics or Plausible). | DeepSeek: SEO implementation. Claude: schema review. |
| **Day 22** | Testing: End-to-end tests (Playwright) for happy paths — browse menu → add to cart → checkout → pay. Admin workflows — create product, manage order lifecycle. Error scenarios (payment failure, webhook timeout). Cross-browser smoke test. | Claude: test plan design. DeepSeek: test implementation. |
| **Day 23** | Final review: Security audit (OWASP top 10), environment variable audit, HitPay production switch, deployment to Vercel, DNS cutover, go-live. Admin training/setup. | Claude: comprehensive security + launch review. DeepSeek: final fixes. |

**Milestone:** 🚀 Live at otterpizza.com.sg with full feature parity + HitPay payments + admin sub-systems.

---

## 7. Project Structure

```
otterpizza.com.sg/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── images/
│   │   └── products/       # Local dev images
│   ├── fonts/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing
│   │   ├── layout.tsx                  # Root layout
│   │   ├── menu/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── order/
│   │   │   └── page.tsx
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   ├── page.tsx
│   │   │   └── success/
│   │   │       └── page.tsx
│   │   ├── locate-us/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── menu/
│   │   │   ├── orders/
│   │   │   ├── promotions/
│   │   │   └── stores/
│   │   ├── api/
│   │   │   ├── menu/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── checkout/
│   │   │   ├── webhooks/hitpay/
│   │   │   ├── stores/
│   │   │   ├── contact/
│   │   │   └── promotions/
│   │   └── auth/
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileMenu.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CTAButtons.tsx
│   │   │   └── PromoBanner.tsx
│   │   ├── menu/
│   │   │   ├── CategoryTabs.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductCard.tsx
│   │   ├── product/
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── QuantitySelector.tsx
│   │   │   └── AddToCartButton.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartIcon.tsx
│   │   ├── checkout/
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── StoreSelector.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── store/
│   │   │   ├── StoreList.tsx
│   │   │   ├── StoreCard.tsx
│   │   │   └── StoreMap.tsx
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       ├── AdminHeader.tsx
│   │       ├── DashboardStats.tsx
│   │       ├── orders/
│   │       │   ├── OrderTable.tsx
│   │       │   ├── OrderDetail.tsx
│   │       │   ├── OrderStatusBadge.tsx
│   │       │   ├── OrderTimeline.tsx
│   │       │   └── OrderPrintSlip.tsx
│   │       ├── menu/
│   │       │   ├── ProductTable.tsx
│   │       │   ├── ProductForm.tsx
│   │       │   ├── ProductImageUpload.tsx
│   │       │   ├── CategoryManager.tsx
│   │       │   └── BulkPriceUpdate.tsx
│   │       ├── promotions/
│   │       │   └── PromotionForm.tsx
│   │       └── stores/
│   │           └── StoreForm.tsx
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── hitpay.ts           # HitPay API client
│   │   ├── cart.ts             # Cart calculations
│   │   ├── promotions.ts       # Promo logic
│   │   ├── email.ts            # Email sending
│   │   ├── utils.ts
│   │   └── services/           # Backend sub-system services
│   │       ├── order-service.ts
│   │       ├── product-service.ts
│   │       ├── store-service.ts
│   │       ├── promotion-service.ts
│   │       ├── payment-service.ts
│   │       ├── email-service.ts
│   │       ├── notification-service.ts
│   │       └── export-service.ts
│   ├── store/
│   │   └── cart.ts             # Zustand cart store
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts            # NextAuth + admin route protection
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── DEVELOPMENT_PLAN.md         # This file
```

---

## 8. AI Development Strategy

### 8.1 Claude (Anthropic) — Strategic Role
- **Architecture design** — System design, data modeling, route planning
- **Code review** — PR review for correctness, security, and patterns
- **Complex logic** — HitPay integration, webhook verification, promo calculation edge cases
- **Security audit** — HMAC verification, CSRF, XSS, SQL injection prevention
- **Design & UX review** — Visual QA, accessibility, responsive design
- **Planning** — Task breakdown, dependency management, risk assessment

### 8.2 DeepSeek v4 — Implementation Role
- **Boilerplate generation** — Components, API routes, form scaffolding
- **Prisma schema + seed** — Database setup and test data
- **CRUD operations** — Admin dashboard forms and tables
- **Styling** — Tailwind utility classes, shadcn/ui composition
- **TypeScript types** — Type definitions from schema
- **Test writing** — Playwright test scripts

### 8.3 Workflow
```
Claude (Plan) → DeepSeek (Code) → Claude (Review) → DeepSeek (Fix) → Claude (Verify)
```

---

## 9. Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| HitPay sandbox → production issues | High | Medium | Test extensively in sandbox. Use test cards + PayNow test flow. |
| Wix image migration failures | Medium | Low | Script the download. Fallback: re-upload from source files. |
| Cart state loss on refresh | Medium | Low | Persist cart to localStorage. Sync with server on login. |
| PostgreSQL connection in serverless | Medium | Low | Use connection pooling (Prisma Data Proxy or PgBouncer). |
| SEO ranking drop after migration | High | Medium | Preserve URL structure where possible. Add 301 redirects. Submit new sitemap. |
| Peak hour load (dinner rush) | Medium | Low | Vercel auto-scaling handles this. ISR for menu pages reduces DB load. |
| Multiple stores — wrong order routing | High | Low | Customer selects store at checkout. Order shows store name prominently. |

---

## 10. Post-Launch (Days 24–37)

| Week | Tasks |
|------|-------|
| **Week 1** | Monitor: Error tracking (Sentry), order success rate, payment failure rate. Hotfix any critical bugs. Admin training on order + product sub-systems. |
| **Week 2** | Enhancements: Order tracking page for customers, SMS notifications (Twilio), customer accounts with order history, repeat-order functionality. |
| **Week 3** | Advanced admin features: Sales analytics dashboard, advanced reporting (by store, by product, by hour), inventory alerts for low-stock items. |
| **Ongoing** | Regular menu updates via admin product sub-system, promotion campaigns, analytics review. Database backups and monitoring.

---

## 11. Cost Estimate (Monthly)

| Service | Tier | Est. Cost (SGD) |
|---------|------|-----------------|
| Vercel Pro | 1 TB bandwidth, 100 GB function exec | $25 |
| PostgreSQL (Supabase/Neon) | 2 GB storage, pooled | $15–$25 |
| HitPay | Per-transaction (0.65%+$0.30 PayNow, 2.9%+$0.30 cards) | Variable |
| Cloudinary / Vercel Blob | Image storage + transforms | $0–$10 |
| Resend | 3,000 emails/mo | Free–$20 |
| Domain | otterpizza.com.sg | ~$30/yr |
| **Total fixed** | | **~$55–$80/mo** |

---

## 12. Key Decisions Required

1. **Delivery vs Pickup model**: Current site only links to Grab/Foodpanda/Deliveroo. Does the rebuild need direct delivery management or just pickup + 3rd-party delivery links?
2. **Customer accounts**: Required (order history, saved addresses) or guest checkout only?
3. **Admin users**: Who needs access? Single admin or role-based (manager, staff)?
4. **Menu PDF**: Keep generating PDF from DB or drop in favor of the live menu page?
5. **Domain/DNS**: Who controls the domain? Need access for Vercel cutover.
6. **HitPay account**: Is there an existing HitPay account or does one need to be set up?

---

*Plan prepared: 2026-06-22 | Stack: Next.js 15 + TypeScript + PostgreSQL + Prisma + HitPay*
