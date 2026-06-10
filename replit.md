# Itamar Vinhos - Wine E-Commerce Store

## Overview

Itamar Vinhos is a wine e-commerce store built with a modern full-stack architecture. The application provides an elegant wine shopping experience with product browsing, filtering, cart management, WhatsApp checkout integration, and an admin panel for managing products and promotions. Located in Itajai, Santa Catarina, Brazil.

## User Preferences

- Preferred communication style: Simple, everyday language
- Brand: "Itamar Vinhos" with wine-themed color palette (burgundy/wine reds)
- WhatsApp number: 5547988140013 (+55 47 98814-0013)
- Location: Itajai, Santa Catarina
- Admin credentials: username "admin", password "Senha123@Xavier"

## Recent Changes

- 2026-02-11: Fixed product editing (prices, photos, descriptions) with explicit field mapping in PATCH route
- 2026-02-11: Added updatedAt timestamp - recently edited products appear first everywhere
- 2026-02-11: Updated wine catalog to 86 real Argentine wines from Pinot Vinhos PDF catalog
- 2026-02-11: Categories simplified to 2: Vinhos Tintos (68 wines), Vinhos Brancos & Orange (18 wines)
- 2026-02-11: All wines with real names and prices from catalog (R$65-480)
- 2026-02-11: Full rebrand from fashion e-commerce to wine store
- 2026-02-11: Wine-themed color palette (burgundy/wine reds for light and dark mode)
- 2026-02-11: WhatsApp checkout flow - sends order summary to WhatsApp
- 2026-02-11: Admin panel at /admin with login authentication and full CRUD for products
- 2026-02-11: PostgreSQL database with Drizzle ORM for products, categories, and admin users

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Context API for cart and theme state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with CSS custom properties for wine theming
- **Component Library**: shadcn/ui (Radix UI primitives with custom styling)
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Authentication**: Simple token-based admin auth with bcrypt password hashing
- **Development**: Vite dev server integration with HMR support

### Data Layer
- **Database**: PostgreSQL (Neon-backed)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle's table definitions
- **Validation**: Zod schemas generated via drizzle-zod
- **Storage**: DatabaseStorage class in `server/storage.ts` with full CRUD

### Key Features
- **WhatsApp Checkout**: Cart items sent as WhatsApp message to store owner
- **Admin Panel**: Login at /admin, manage products (add, edit, delete)
- **Product Catalog**: 86 real Argentine wines from Pinot Vinhos catalog with authentic names and prices
- **Dark/Light Mode**: Full theme support with wine-inspired colors

### Project Structure
```
├── client/src/           # React frontend
│   ├── components/       # UI components (Header, Footer, ProductCard, etc.)
│   ├── components/ui/    # shadcn/ui base components
│   ├── pages/            # Route pages (Home, Products, ProductDetail, Admin)
│   ├── lib/              # Utilities, context providers, query client
│   └── hooks/            # Custom React hooks
├── server/               # Express backend
│   ├── index.ts          # Server entry point with data initialization
│   ├── routes.ts         # API route definitions (products, admin, auth)
│   └── storage.ts        # Database access layer with wine catalog data
├── shared/               # Shared code between client/server
│   └── schema.ts         # Drizzle schema and TypeScript types
```

### API Routes
- `GET /api/products` - List all products (optional `?category=` filter)
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - List all categories
- `POST /api/admin/login` - Admin login (returns token)
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/verify` - Verify admin token
- `POST /api/admin/products` - Create product (auth required)
- `PATCH /api/admin/products/:id` - Update product (auth required)
- `DELETE /api/admin/products/:id` - Delete product (auth required)
