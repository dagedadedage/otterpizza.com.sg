@AGENTS.md

# Otter Pizza Website — otterpizza.com.sg

## Quickstart
```bash
npm install && npx prisma generate && npx prisma migrate dev --name init && npx tsx prisma/seed.ts
npm run dev
```
Open http://localhost:3000

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma v6 with SQLite (`prisma/dev.db`) — switch to PostgreSQL for production
- HitPay REST API for payments (sandbox by default)
- Cart: React Context + useReducer + localStorage persistence

## Database
- SQLite at `prisma/dev.db`
- Seed: 31 products, 5 categories, 9 stores, 3 promotions, 1 admin user
- Admin: `admin@otterpizza.com.sg` / `admin123`
- **Tags** stored as JSON strings (e.g. `"[\"Signature\"]"`) — use `parseTags()` from `@/lib/utils`
- **Prices** are `Float` (SQLite) — use `Number()` not `.toNumber()`
- **Enums** are stored as `String` — compare with string literals

## Key Files
- `prisma/schema.prisma` — Database schema (SQLite, no `@db.Decimal`, no enum types, no native arrays)
- `prisma/seed.ts` — Seeds all data
- `src/lib/prisma.ts` — PrismaClient singleton
- `src/lib/hitpay.ts` — HitPay API: createPayment, getStatus, verifyWebhook, refund
- `src/lib/promotions.ts` — Tiered discounts ($60/$200/$500 thresholds)
- `src/lib/utils.ts` — cn(), formatPrice(), parseTags(), slugify()
- `src/store/cart-context.tsx` — CartProvider + useCart() hook (CartItem: productId, sku, name, price, salePrice, quantity, imageUrl)
- `src/lib/admin-auth.ts` — Admin API auth (x-admin-key header)

## Promotions
- $60+ → Free Delivery | $200+ → 10% OFF + Free Delivery | $500+ → 15% OFF + Free Delivery

## HitPay Integration
- Checkout: `POST /api/checkout` creates order + HitPay payment request → redirects to HitPay checkout
- Webhook: `POST /api/webhooks/hitpay` verifies HMAC-SHA256, updates order status
- Sandbox by default — set `HITPAY_API_KEY` for production

## Brand
- Primary: #E85D2C | BG: #FEFBF7 | Dark: #2D1B14 | Font: Inter

## Production Deploy (Vultr: 45.77.172.222)
**CRITICAL: Never SCP `.next` from Windows to Linux server.** Prisma client is platform-specific — a Windows build will fail with `Cannot find module '@prisma/client-*'` on Linux.

### Correct deploy workflow:
```bash
# 1. Build and test locally (optional but recommended)
npm run build

# 2. Commit and push
git add -A && git commit -m "..." && git push origin master

# 3. Run deploy script on server (builds on Linux, avoids binary mismatch)
ssh root@45.77.172.222 "bash /opt/otterpizza/deploy.sh"
```

### Deploy script (`deploy.sh`) does:
1. `git pull` — fetch latest source
2. `npx prisma generate` — generate Linux Prisma client binary
3. `npx prisma db push --skip-generate` — apply schema changes if any
4. `NODE_OPTIONS='--max-old-space-size=640' npm run build` — build (1GB RAM needs swap)
5. `pm2 restart otterpizza` — restart app

### Server details:
- IP: 45.77.172.222 | OS: Ubuntu 26.04 | RAM: 1GB (2GB swap)
- App: `/opt/otterpizza` | PM2: `pm2 status`
- Nginx: `/etc/nginx/sites-available/otterpizza` | SSL: certbot auto-renew
- Admin: `admin@otterpizza.com.sg` / `admin123` (via https://otterpizza.com/admin/login)
