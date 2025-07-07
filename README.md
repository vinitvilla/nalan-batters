# Nalan Batters



## Project Overview

Nalan Batters is a web application built with Next.js, TypeScript, and Prisma ORM. It features a modern UI and supports user authentication, product management, cart functionality, and admin features. The project uses Firebase for authentication and admin operations, and Prisma for database access and migrations.

### Key Features

- **Next.js App Router**: Uses the `/app` directory structure for routing.
- **TypeScript**: Type-safe codebase for both frontend and backend.
- **Prisma ORM**: Database schema and migrations managed in `/prisma`.
- **Firebase Admin SDK**: For secure admin operations and authentication.
- **Modern UI Components**: Located in `/src/components` and `/src/components/ui`.
- **Cart & Checkout**: Cart state managed in `/src/store/cartStore.ts`, with checkout flow in `/src/checkout`.
- **Admin Dashboard**: Admin pages and API handlers in `/src/app/admin`.
- **User Authentication**: Phone-based user auth flow in `/src/components/auth`.
- **Reusable Hooks**: Custom hooks for authentication and sign-out in `/src/hooks`.
- **API Routes**: Organized under `/src/app/api`.
- **Seed Scripts**: Database seeding scripts in `/prisma/seeds`.
- **Global Styles**: Located in `/src/app/globals.css`.
- **Font Optimization**: Uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load [Geist](https://vercel.com/font).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

- `src/app/` - Main app directory (routing, layouts, pages, admin, API, checkout, signin)
- `src/components/` - UI and feature components (cart, auth, forms, etc.)
- `src/store/` - State management (cart, user, product, address)
- `src/lib/` - Utility functions, Prisma client, Firebase integration
- `prisma/` - Database schema, migrations, and seed scripts
- `public/` - Static assets (SVGs, images)
- `scripts/` - Utility scripts (e.g., setAdmin.js)
- `types/` - TypeScript type definitions

## Database

- **Prisma ORM**: Database schema in `prisma/schema.prisma`
- **Migrations**: In `prisma/migrations/`
- **Seeding**: Use `prisma/seed.ts` or scripts in `prisma/seeds/`

## Authentication

- **Firebase Admin SDK**: Credentials in `nalan-batters-firebase-adminsdk-fbsvc-0b103d9719.json`
- **User Auth Flow**: Phone-based, with OTP and registration steps

## Admin Features

- **Admin Dashboard**: `/src/app/admin`
- **API Handlers**: `/src/app/admin/api-handler.ts`
- **Admin Utilities**: `/src/lib/requireAdmin.ts`, `/scripts/setAdmin.js`

## UI/UX

- **Modern UI**: Custom components in `/src/components/ui`
- **Global Styles**: `/src/app/globals.css`
- **Font**: [Geist](https://vercel.com/font) via `next/font`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
