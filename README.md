# Mannequin Care

Storefront and admin platform for [Mannequin Care](https://mannequincare.in) — India's Vitamin E skincare specialist, offering stretch mark repair, hair strengthening, and post-pregnancy care products formulated for Indian skin tones.

Built with Next.js App Router, MongoDB, and Razorpay, this repo contains the full customer-facing storefront, an internal admin dashboard, and the CI/CD pipeline that deploys both.

## Features

**Storefront**
- Product catalogue with categories/subcategories, filtering, sorting, and search
- Product detail pages with image gallery, reviews, and related products
- Cart and wishlist, with guest-cart support that merges into the account on login
- Checkout with saved addresses, coupon codes, and Razorpay payment (COD fallback)
- Order history and order confirmation/tracking
- Blog with Markdown content
- Interactive WebGL "flipbook" product brochure (Three.js / React Three Fiber)
- Account management, email verification, and password reset flows

**Admin dashboard** (`/admin`)
- Product, category, coupon, and blog CRUD
- Order management and review moderation
- Contact message inbox and site settings
- User management
- Image uploads via Cloudinary

**Platform**
- Authentication via Auth.js (NextAuth v5) with MongoDB adapter
- Transactional email (order confirmations, password reset, verification) via Nodemailer
- SEO: sitemap, robots.txt, Open Graph/Twitter image generation
- Dockerized, with zero-downtime blue/green deploys to a VPS via GitHub Actions

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, Radix UI primitives |
| Database | MongoDB (Mongoose) |
| Auth | Auth.js (NextAuth v5) |
| Payments | Razorpay |
| Media | Cloudinary |
| Email | Nodemailer (Gmail) |
| 3D/WebGL | Three.js, React Three Fiber, React Three Drei |
| Testing | Vitest |
| CI/CD | GitHub Actions → GHCR → Docker Compose (blue/green) |

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB connection string (Atlas replica set, since order creation uses transactions)
- Razorpay, Cloudinary, and Gmail credentials for full functionality (optional for basic local browsing)

### Setup

```bash
npm install
cp .env.example .env.local   # then fill in real values, see below
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy [.env.example](.env.example) to `.env.local` and fill in each value. It documents every variable in detail (MongoDB URI, `AUTH_SECRET`/`AUTH_URL`, Cloudinary keys, Razorpay keys + webhook secret, Gmail app password, `NEXT_PUBLIC_APP_URL`). Never commit `.env.local`.

### Seed the database

```bash
npm run db:seed
```

Populates product categories/subcategories and sample products.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run db:seed` | Seed categories and products into MongoDB |

## Project structure

```
app/                  Next.js App Router routes
  (admin)/admin/       Admin dashboard (products, orders, coupons, blogs, users, ...)
  api/                 Route handlers (auth, cart, wishlist, checkout, orders, webhooks, ...)
  auth/                Login, sign-up, password reset pages
  shop/, products/     Storefront catalogue and PDP
  cart/, checkout/,
  wishlist/, orders/   Customer flows
  blog/                Blog listing and post pages
  brochure/            WebGL flipbook catalogue
components/           Shared UI, storefront sections, admin, flipbook/WebGL, auth forms
lib/
  db/models/           Mongoose schemas
  db/connect.ts        MongoDB connection helper
  services/            Business logic (cart, orders, pricing, coupons, email, ...)
  auth-helpers.ts,
  cloudinary.ts         Integration helpers
auth.ts               Auth.js configuration
middleware.ts         Route protection for /account and /admin
scripts/               Seed script and deploy script
tests/                 Vitest test suites
```

## Testing

```bash
npm test
```

Vitest runs suites in `tests/**/*.test.ts` (e.g. pricing/discount calculations).

## Deployment

CI/CD, Docker, and the zero-downtime blue/green deploy process are documented in detail in [DEPLOYMENT.md](DEPLOYMENT.md). In short: every push runs lint/typecheck/test/build via GitHub Actions; pushes to `main` build a Docker image, push it to GHCR, and roll it out to the VPS with no downtime.
