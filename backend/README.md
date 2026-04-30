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

## Frontend-oriented JSON rules

- `Decimal` values are serialized to numbers.
- `Date` values are serialized to ISO strings.
- Sensitive fields such as `passwordHash` are never returned from controllers.
- Nested responses already include related entities needed by the frontend:
  `product.category`, `cart.items`, `order.items`, `order.payment`, `news.author`.
