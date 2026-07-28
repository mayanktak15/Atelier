# Atelier — Fashion E-Commerce Storefront

A modern, editorial fashion e-commerce storefront built as a React + Tailwind + shadcn/ui frontend. User authentication, cart storage, product catalog, and orders are backed by Lovable Cloud (Supabase). The public storefront now reads from the live `products` table and creates real orders, so the core shopping loop is end-to-end functional. The project can still be wired to a dedicated Express / PostgreSQL / payment-gateway backend later if desired.

## Version history

### v6 — Stock validation & atomic inventory management (current)

- **Pre-checkout stock check** — before creating an order, `/checkout` calls the `check_and_decrement_stock` database function to verify every cart item has enough available inventory.
- **Blocked checkout on shortage** — if any item exceeds available stock, order creation is cancelled and the UI shows a clear error listing the affected products, requested quantity, and available quantity for each.
- **Atomic stock decrement** — stock is decremented inside a single Postgres transaction that locks the relevant product rows, preventing race conditions when multiple users check out simultaneously.
- **No partial orders** — the function validates all items before decrementing anything, so orders are either fully placed or fully rejected; no partial `orders`/`order_items` rows are created.
- **Automatic stock restore on cancellation** — when an order status changes to `cancelled` (from `/orders/:id` or `/admin/orders/:id`), a trigger restores the ordered quantities back to the `products` table automatically.
- **Live admin stock view** — `/admin/products` reads the current `stock` value directly, so it always reflects the real inventory after orders and cancellations.
- **No payment yet** — orders still complete with status `pending` and no payment step; payments are the next layer after inventory is solid.

### v5 — Storefront connected to Supabase

- **Live product catalog** — the public storefront no longer reads from `src/lib/mock-data.ts`. `/`, `/shop`, `/shop/:category`, and `/product/:slug` now fetch products directly from the Supabase `products` table.
- **No UI regression** — all existing filters, sorting, search, empty states, and PDP layouts remain intact; only the data source changed.
- **Empty-state guidance** — if the `products` table is empty, the shop pages show a prompt to seed it via the **Import demo catalog** button on `/admin/products`.
- **Real order creation** — signed-in users completing `/checkout` now create a real `orders` row plus matching `order_items` rows (capturing product, size, color, quantity, and price at time of purchase) using the shipping address entered in checkout.
- **Guest checkout gate** — guests on `/checkout` are prompted to sign in or sign up and are redirected back to checkout once authenticated; orders require a `user_id`, so no anonymous checkout is allowed.
- **Post-checkout cleanup** — after a successful order, the user's server cart is cleared and they are redirected to `/order-confirmation` showing the actual order.
- **Real customer order history** — `/orders` and `/orders/:id` now read the signed-in user's real orders from Supabase and support real cancellation of `pending` orders.
- **Search uses live catalog** — the header search autocomplete now searches the real `products` table.
- **Admin ↔ storefront consistency** — products added/edited/deleted in `/admin/products` immediately reflect on the public shop, and orders placed at checkout immediately appear in `/admin/orders` and the customer's own `/orders`.
- **No payments yet** — orders are created with status `pending` and no payment step; Razorpay/Stripe integration is the next layer.

### v4 — Admin management dashboard

- **Admin product catalog** — the `products` table is now a real Supabase table. Admins can browse, search, paginate, add, edit, and delete products from `/admin/products`.
- **Seed from mock data** — an **Import demo catalog** button on `/admin/products` upserts the existing `src/lib/mock-data.ts` product list into the new `products` table, so nothing is lost during the transition.
- **Product form** — full create/edit form with name, description, brand, category, price, MRP, stock, sizes, colors, images, material, tags, and trending flag. Sizes/colors/images are stored as JSON arrays.
- **Delete confirmation** — products are deleted through a confirmation dialog to prevent accidental data loss.
- **Admin order management** — `/admin/orders` lists all orders with search and status filtering (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
- **Order detail view** — `/admin/orders/:id` shows customer details, shipping address, line items, and a status history, plus buttons to advance the order status.
- **Live admin dashboard** — `/admin` now shows real counts: total products, total orders, and total revenue, plus a list of recent orders pulled from Supabase.
- **Admin access control** — all `/admin/*` routes remain protected by the existing `_admin` layout, which requires the `admin` role. Non-admins are redirected away.
- **RLS policies** — `products` and `orders`/`order_items` are protected by RLS: only admins can write product/order data; customers can only read their own orders.
- **Storefront linked in v5** — the public shop pages were kept unchanged in v4, then wired to the `products` table in the next version. See **v5** above.


### v3 — Server-backed cart

- **Per-user cart persistence** — signed-in shoppers get their cart stored in a Supabase `cart_items` table (product, size, color, quantity) instead of just `localStorage`, so carts follow them across devices and browsers.
- **Guest cart still works** — signed-out visitors continue to use a `localStorage` cart with no behavior change.
- **Guest → user merge on login** — when a guest signs in, their local cart is merged into the server cart (quantities summed for matching variants) and the local copy is cleared.
- **RLS-protected rows** — each user can only read/write their own `cart_items`; a unique index on `(user_id, product_id, size, color)` guarantees re-adding a variant updates its quantity instead of duplicating rows.
- **Sign-out hygiene** — signing out clears the in-memory cart (server rows are preserved) and starts a fresh local guest cart.
- **No UI changes** — cart icon, count, `/cart` page, and add-to-cart buttons keep the same behavior; the swap is purely at the data layer, with a loading state to avoid flashing an empty cart on initial load.

### v2 — Authentication & route protection


- **Real user authentication** powered by Lovable Cloud / Supabase Auth.
- **Customer signup / login** with email + password at `/signup` and `/login`.
- **Session persistence** across reloads via Supabase Auth sessions.
- **Protected customer routes** — `/account`, `/orders`, and `/orders/:id` now require a logged-in user.
- **Real profile data** — the `/account` profile tab reads from and updates the Supabase `profiles` table instead of showing static mock data.
- **Password reset flow** — forgot-password and reset-password pages wired to Supabase Auth.
- **Separate admin authentication** — `/admin/login` gates the `/admin` dashboard behind the `admin` role.
- **Header auth state** — the site header shows login/signup links when signed out and an account menu with sign-out when signed in.
- **Role-based access** — `user_roles` table with `customer` and `admin` roles, backed by RLS policies.

### v1 — Storefront UI only

- **Responsive homepage** — hero banner, category navigation, and personalized recommendation sections (trending, recently viewed, related products).
- **Product listing pages** — `/shop` and `/shop/:category` with sidebar filters (price, size, brand, color, discount) and sorting.
- **Product detail page** — `/product/:slug` with image gallery, color/size selectors, size guide, and customer reviews.
- **Cart** — `/cart` with quantity management, remove, and price breakdown.
- **Checkout UI** — `/checkout` with address, order review, and payment method steps.
- **Order confirmation** — `/order-confirmation` showing a mock order summary.
- **Account pages** — `/account`, `/orders`, and `/orders/:id` for profile, saved addresses, wishlist, and order history (mock data only).
- **Design system** — warm editorial palette (cream, espresso, terracotta) with `Playfair Display` headings and `Inter` body text, managed via CSS variables in `src/styles.css`.
- **Mock data layer** — 30 products, categories, orders, addresses, and recommendation helpers in `src/lib/mock-data.ts`.
- **Cart state** — local `localStorage` based cart and browsing history in `src/store/cart.tsx`.

## Tech stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework with file-based routing
- [React 19](https://react.dev/) + [TypeScript](https://www.typescript.org/) (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com/) — utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) — accessible component primitives
- [Lucide React](https://lucide.dev/) — icons
- [Supabase](https://supabase.com/) — authentication, cart persistence, product catalog, and order data via Lovable Cloud
- `src/lib/products-db.ts` — TanStack Query data layer that maps Supabase `products` rows to the existing `Product` interface used by the storefront


## Project structure

```text
src/
  components/        # Reusable UI components (header, footer, product cards, admin forms)
  lib/               # Mock data, formatting helpers, admin utilities, Supabase types
  routes/            # TanStack Start file-based routes (public + authenticated + admin)
  store/             # Cart, browsing history, and auth state
  styles.css         # Global theme, design tokens, Tailwind config
```

## Running locally

```sh
npm install
npm run dev
```

The dev server starts at `http://localhost:8080`.

## Important notes

- **Authentication is real** — customer and admin login use Supabase Auth via Lovable Cloud.
- **Cart persistence is real for signed-in users** — authenticated shoppers have their cart stored in Supabase; guests still use `localStorage`. See **v3** in the version history above.
- **Product catalog is real end-to-end** — the public storefront reads from the `products` table, and admins manage it from `/admin/products`. See **v5** above.
- **Orders are real end-to-end** — signed-in customers create real `orders`/`order_items` rows at checkout, view them on `/orders`, and admins manage them on `/admin/orders`. See **v5** above.
- **No real payments** — orders are created with status `pending` and no payment step; Razorpay / Stripe integration is the next layer.
- **Admin role assignment** — admins must be granted the `admin` role in the `user_roles` table; sign-up alone only assigns the `customer` role.

## Next steps

1. Integrate a payment provider (Razorpay / Stripe) on the checkout page before orders are submitted.
2. Add email notifications for orders and shipping updates.
3. Add real shipping rate calculation and tracking-number support.




