# Backend

NestJS + Prisma backend for the climate equipment storefront.

## Module structure

- `src/prisma` - Prisma client lifecycle and database access.
- `src/common` - global DTOs, Prisma error mapping and JSON serialization.
- `src/users` - `User` and `ClientProfile`.
- `src/catalog` - `Category`, `Product`, `Discount`.
- `src/service-offerings` - catalog of installation/maintenance services.
- `src/carts` - `Cart` and `CartItem`.
- `src/orders` - `Order`, `OrderItem`, `OrderTemplate`, `Payment`.
- `src/news` - news feed for the public site.
- `src/admin-users` - admin panel accounts.

## Quick start

```bash
npm install
copy .env.example .env
npm run prisma:generate
npm run build
```

## Mail sending (SMTP with Resend fallback)

The backend can send mail via SMTP (primary). If SMTP is not configured or sending fails, it can fall back to Resend.

- SMTP config: `MAIL_USER`, `MAIL_PASS`, optional `MAIL_FROM`, `MAIL_SMTP_*`.
- Resend fallback config: `RESEND_API_KEY`, `RESEND_FROM` (must be a verified sender, e.g. `no-reply@climatrade.store`).

## CDEK shipping quote (tariff calculator)

Checkout can request an estimated CDEK shipping price via `POST /api/shipping/cdek/quote`.
Configure the following env vars:

- `CDEK_CLIENT_ID`, `CDEK_CLIENT_SECRET` - API credentials.
- `CDEK_BASE_URL` - optional, defaults to `https://api.cdek.ru`.
- Sender location (one of):
  - `CDEK_FROM_POSTAL_CODE`
  - `CDEK_FROM_CITY_CODE`
  - `CDEK_FROM_DELIVERYPOINT_CODE` (optional; PVZ code, default `MSK2401`)
- Package defaults (used because products currently do not store weight/dimensions):
  - `CDEK_DEFAULT_WEIGHT_G` (default `1000`)
  - `CDEK_DEFAULT_LENGTH_CM` (default `20`)
  - `CDEK_DEFAULT_WIDTH_CM` (default `20`)
  - `CDEK_DEFAULT_HEIGHT_CM` (default `10`)

If `CDEK_FROM_POSTAL_CODE` / `CDEK_FROM_CITY_CODE` are not set, the backend falls back to a Moscow center PVZ for testing (`CDEK_FROM_DELIVERYPOINT_CODE=MSK2401`, then it falls back to `101000`, and it may try to resolve `city_code` for "Москва" via CDEK locations API).

## Frontend-oriented JSON rules

- `Decimal` values are serialized to numbers.
- `Date` values are serialized to ISO strings.
- Sensitive fields such as `passwordHash` are never returned from controllers.
- Nested responses already include related entities needed by the frontend:
  `product.category`, `cart.items`, `order.items`, `order.payment`, `news.author`.
