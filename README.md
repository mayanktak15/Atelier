# Atelier — Fashion E-Commerce Storefront

A modern, editorial fashion e-commerce storefront built with **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **shadcn/ui**. Backed by **Supabase** (PostgreSQL & GoTrue Auth), Atelier features live catalog management, server-synchronized carts, role-based access control, and an atomic, concurrency-safe inventory checkout pipeline.

---

## Quick Links & Documentation

| Document | Description |
|---|---|
| [High-Level Design (HLD)](file:///home/linus/Desktop/atlier/stylehorizon/docs/architecture/HLD.md) | System overview, architecture diagrams, client-server tiers, security & transaction models |
| [Low-Level Design (LLD)](file:///home/linus/Desktop/atlier/stylehorizon/docs/architecture/LLD.md) | File-based routes, ER diagrams, PostgreSQL stored procedures, triggers, state providers |
| [What We Have Achieved](file:///home/linus/Desktop/atlier/stylehorizon/docs/achievements.md) | Detailed version history (v1–v6), milestones achieved, and future roadmap |
| [Utilities Reference](file:///home/linus/Desktop/atlier/stylehorizon/docs/utils.md) | Full API reference for helpers, data mappers, and telemetry functions |

---

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack React with SSR & file-based routing)
- **Frontend Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescript.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Data Caching**: [TanStack React Query](https://tanstack.com/query) + React Context (`AuthContext`, `CartContext`)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, GoTrue Auth, Stored Procedures)
- **Bundler & Server**: [Vite](https://vitejs.dev/) + [Nitro](https://nitro.unjs.io/)

---

## Basic Utilities Quick Reference

Common helper functions located in `src/lib/`:

### 1. Style Utilities (`src/lib/utils.ts`)
* **`cn(...inputs)`**: Combines `clsx` and `tailwind-merge` for conflict-free conditional Tailwind classes.
  ```typescript
  import { cn } from "@/lib/utils";
  const buttonClass = cn("px-4 py-2 rounded", isActive && "bg-primary text-white");
  ```

### 2. Currency Formatting (`src/lib/format.ts`)
* **`inr(amount)`**: Formats numeric values to Indian Rupee strings using Indian locale formatting.
  ```typescript
  import { inr } from "@/lib/format";
  inr(2499); // "₹2,499"
  ```

### 3. Image Fallbacks (`src/lib/image-fallback.ts`)
* **`getProductImageFallback(title, category, index)`**: Generates high-quality Unsplash fallbacks when product images are missing or fail to load.

### 4. Product Catalog Hooks (`src/lib/products-db.ts`)
* **`useProducts()`**: TanStack Query hook fetching all catalog products from Supabase with 30s cache.
* **`useProduct(slug)`**: Query hook fetching a single product by URL slug.
* **`mapProductRow(row)`**: Normalizes raw PostgreSQL JSONB columns into typed `Product` objects.

### 5. Admin Helpers (`src/lib/admin-products.ts`)
* **`seedDemoProducts()`**: Seeds initial mock products into the live database.
* **`upsertProduct(data, id)`**: Inserts or updates products with serialized JSONB fields.
* **`deleteProduct(id)`**: Removes products from the database.

*For complete parameters and usage examples, see [docs/utils.md](file:///home/linus/Desktop/atlier/stylehorizon/docs/utils.md).*

---

## Project Structure

```text
stylehorizon/
├── docs/                      # Architectural & technical documentation
│   ├── architecture/
│   │   ├── HLD.md             # High-Level Architecture & system diagrams
│   │   └── LLD.md             # Low-Level Design, schemas, stored procedures
│   ├── achievements.md        # Version history (v1-v6) & roadmap
│   └── utils.md               # Detailed utility functions guide
├── src/
│   ├── components/            # Reusable UI components & shadcn primitives
│   │   ├── admin/             # Admin dashboard forms & tables
│   │   └── ui/                # Accessible design primitives
│   ├── integrations/supabase/ # Supabase browser & server clients, types
│   ├── lib/                   # Formatters, query hooks, admin actions, utils
│   ├── routes/                # TanStack Start file-based routes
│   │   ├── _admin.*           # Admin routes (protected by admin role)
│   │   ├── _authenticated.*   # Customer routes (account, orders)
│   │   └── __root.tsx         # Root layout shell
│   ├── store/                 # Global state (AuthContext, CartContext)
│   └── styles.css             # Design tokens and theme variables
└── supabase/
    └── migrations/            # Version-controlled PostgreSQL schemas & RPCs
```

---

## Getting Started

### Prerequisites
- Node.js (v18+) or Bun
- Supabase Project URL and Anon Key (configured in environment)

### Installation
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will launch at `http://localhost:8080`.

### Scripts
- `npm run dev`: Launch Vite + Nitro dev server
- `npm run build`: Compile production build with SSR
- `npm run lint`: Run ESLint checks
- `npm run format`: Format source code with Prettier
