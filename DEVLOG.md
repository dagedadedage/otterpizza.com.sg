# Otter Pizza — Development Log

## 2026-06-23 — Initial Build (Overnight Session)

### Summary
Complete rebuild of otterpizza.com.sg from Wix to custom stack. All 4 phases executed against the development plan.

### Phase 1: Foundation
- Scaffolded Next.js 16 + TypeScript + Tailwind CSS v4 + Prisma v6 (SQLite)
- Designed full database schema: Category, Product, Store, Order, OrderItem, OrderStatusLog, OrderNote, ContactSubmission, Promotion, PriceHistory, AdminUser
- Installed shadcn/ui primitives, Zustand, bcryptjs, lucide-react, zod, resend
- Seeded database: 31 products (5 categories), 9 stores, 3 promotions, 1 admin user

### Phase 2: Public Pages
- Landing page: Hero + 3 CTAs + promo banner + featured products
- Menu page: Category tabs (All/Classic/Premium/Specialty/Sides/Drinks) + 3-col product grid
- Product detail: Full info, price with sale handling, quantity selector, add to cart
- Locate Us: 9 store cards with addresses, delivery platform links (Grab/Foodpanda/Deliveroo), contact form

### Phase 3: Cart, Checkout & HitPay
- Cart: React Context + useReducer with localStorage persistence
- Promo calculations: FREE DELIVERY ≥$60, 10% OFF ≥$200, 15% OFF ≥$500
- Checkout: Customer info form, store selector, order summary
- HitPay integration: `POST /api/checkout` creates payment request, `POST /api/webhooks/hitpay` with HMAC-SHA256 verification
- Success/cancel pages

### Phase 4: Backend Sub-Systems & Admin
- Order Management: Full lifecycle (PENDING→CONFIRMED→PREPARING→READY→COMPLETED), status transitions, admin notes, timeline
- Product Management: CRUD, stock toggle, category management, bulk price update
- Store, Promotion, Contact management
- Admin auth: x-admin-key header check
- Admin dashboard: Stats cards, recent orders, full CRUD interfaces

### Tech Decisions
- **SQLite over PostgreSQL**: Chosen for dev reliability after Prisma v7 adapter issues. PostgreSQL migration path documented.
- **React Context over Zustand**: Chosen for cart state — better salePrice support in the context implementation.
- **Prisma v6 downgrade**: Prisma v7 requires adapters not yet available for SQLite. Will upgrade when moving to PostgreSQL.

### File Count
- 72 TypeScript/TSX source files
- 34 routes (16 pages, 18 API endpoints, 1 webhook)
- 24 React components
- 8 lib/service modules

### Known Issues / Next Steps
- [ ] Configure real HitPay API keys (currently sandbox/mock)
- [ ] Add NextAuth.js for admin authentication (currently header-based)
- [ ] Switch SQLite → PostgreSQL for production
- [ ] Upload product images to Cloudinary/Blob storage
- [ ] Run Playwright E2E tests
- [ ] DNS cutover from Wix to Vercel
- [ ] Add 301 redirects for old Wix URLs

### Build Status
✓ Build passing, zero TypeScript errors, zero ESLint errors
✓ Dev server running at localhost:3000
✓ All public pages returning HTTP 200
✓ All API routes functional
✓ Admin dashboard accessible at /admin
