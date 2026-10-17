# Utility Functions & Helper Services

This document details the core utility functions, data mapping helpers, and formatting tools available in `src/lib/`.

---

## 1. Class Name Merging (`src/lib/utils.ts`)

### `cn(...inputs: ClassValue[]): string`
Utility combining `clsx` and `tailwind-merge`. Ensures dynamic Tailwind utility classes merge cleanly without conflicts (e.g., resolving `p-2` vs `p-4` priority).

```typescript
import { cn } from "@/lib/utils";

// Example
<button className={cn("px-4 py-2 bg-primary text-white", isBusy && "opacity-50 cursor-not-allowed")} />
```

---

## 2. Formatting Helpers (`src/lib/format.ts`)

### `inr(amount: number): string`
Formats any numeric value into Indian Rupee currency format without fractional decimals.

```typescript
import { inr } from "@/lib/format";

inr(1499); // Output: "₹1,499"
inr(125000); // Output: "₹1,25,000"
```

---

## 3. Product Image Fallback (`src/lib/image-fallback.ts`)

### `getProductImageFallback(title: string, category: string, index?: number): string`
Provides high-resolution editorial fashion photography URLs from Unsplash based on product category when an image fails to load or is not provided.

```typescript
import { getProductImageFallback } from "@/lib/image-fallback";

const placeholder = getProductImageFallback("Linen Shirt", "men", 0);
```

---

## 4. Product Database & Query Layer (`src/lib/products-db.ts`)

### `mapProductRow(row: ProductRow): Product`
Transforms raw Supabase database rows into typed `Product` objects, safely converting JSONB arrays and color variant objects `{ name, hex }`.

### `useProducts()`
TanStack Query hook that fetches all products with automatic caching (30s stale time) and loading/error states.

```typescript
import { useProducts } from "@/lib/products-db";

function Catalog() {
  const { data: products, isLoading, error } = useProducts();
  if (isLoading) return <LoadingSpinner />;
  return <ProductGrid products={products} />;
}
```

### `useProduct(slug: string)`
TanStack Query hook that fetches an individual product by its slug.

---

## 5. Admin Utilities (`src/lib/admin-products.ts`)

### `seedDemoProducts(): Promise<{ count: number }>`
Upserts all mock catalog products from `src/lib/mock-data.ts` into the live Supabase `products` table. Useful for initial staging, testing, and sandbox environments.

### `upsertProduct(data: ProductFormData, id?: string): Promise<string>`
Creates or updates a product row in Supabase, serializing arrays into valid JSONB structures.

### `deleteProduct(id: string): Promise<void>`
Removes a product from the database after confirmation.

---

## 6. Error Telemetry (`src/lib/error-capture.ts`)

### `captureError(error: unknown, context?: Record<string, unknown>): void`
Captures unhandled exceptions and dispatches structured diagnostic context to error reporting handlers without breaking the user experience.
