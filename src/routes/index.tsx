import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, type Product } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-db";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { handleImgError } from "@/lib/image-fallback";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier — Considered fashion for every day" },
      { name: "description", content: "Discover the new season at Atelier: linen dresses, tailored wool, cashmere knits and Italian leather. Free shipping over ₹1,999." },
      { property: "og:title", content: "Atelier — Considered fashion for every day" },
      { property: "og:description", content: "Discover the new season at Atelier: linen dresses, tailored wool, cashmere knits and Italian leather. Free shipping over ₹1,999." },
    ],
  }),
  component: Home,
});

function Home() {
  const { recentlyViewed } = useCart();
  const { data: products, isLoading } = useProducts();

  const list = products ?? [];
  const trending = list.filter((p) => p.trending);
  const recentlyViewedProducts = recentlyViewed
    .map((id) => list.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 8);
  const recommended = list.slice(0, 8);
  const newIn = list.slice(6, 14);

  return (
    <>
      <section className="relative overflow-hidden bg-muted/40">
        <div className="container-x grid gap-8 lg:grid-cols-2 items-center py-14 md:py-20">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-accent font-medium">Autumn Edit · 2026</div>
            <h1 className="mt-4 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] font-semibold">
              A wardrobe you'll keep coming back to.
            </h1>
            <p className="mt-5 text-muted-foreground text-lg max-w-md">
              Thoughtfully made pieces in linen, wool and silk — designed to layer, live and last.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link
                to="/shop/$category"
                params={{ category: "women" }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Shop women <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop/$category"
                params={{ category: "men" }}
                className="inline-flex items-center rounded-md border border-input px-6 py-3 text-sm font-medium hover:bg-muted"
              >
                Shop men
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=1200&q=80"
              alt="Model wearing the autumn edit"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Shop by category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => {
            const p = list.find((x) => x.category === c.slug);
            return (
              <Link
                key={c.slug}
                to="/shop/$category"
                params={{ category: c.slug }}
                className="group relative aspect-[3/4] overflow-hidden rounded-md bg-muted"
              >
                {p && (
                  <img
                    src={p.images[0]}
                    alt={c.label}
                    onError={handleImgError}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <div className="font-display text-lg font-medium">{c.label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {!isLoading && list.length === 0 && (
        <section className="container-x py-14">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <div className="font-display text-2xl font-semibold">The catalog is empty</div>
            <p className="mt-2 text-sm text-muted-foreground">
              No products yet. An admin can import the demo catalog from the admin panel.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/admin">Go to admin</Link>
            </Button>
          </div>
        </section>
      )}

      {recentlyViewedProducts.length > 0 && (
        <Section title="Recently viewed" products={recentlyViewedProducts} />
      )}

      {recommended.length > 0 && (
        <Section
          title="Recommended for you"
          subtitle="Curated on your recent browsing"
          products={recommended}
        />
      )}

      {trending.length > 0 && <Section title="Trending now" products={trending} />}

      {newIn.length > 0 && <Section title="New in" products={newIn} />}

      <section className="container-x py-14">
        <div className="relative overflow-hidden rounded-lg bg-primary text-primary-foreground">
          <div className="grid md:grid-cols-2">
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <div className="text-xs uppercase tracking-[0.25em] opacity-70">The Ethnic Edit</div>
              <h3 className="mt-3 font-display text-4xl md:text-5xl font-semibold">
                Heritage weaves, quietly modernised.
              </h3>
              <p className="mt-4 opacity-80 max-w-md">
                Discover our new capsule of handwoven sarees, block-print kurtas and considered occasion wear.
              </p>
              <Link
                to="/shop/$category"
                params={{ category: "ethnic" }}
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-background px-6 py-3 text-sm font-medium text-foreground hover:opacity-90 self-start"
              >
                Explore the edit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative aspect-[4/3] md:aspect-auto min-h-[280px]">
              <img
                src="https://images.unsplash.com/photo-1610030469668-8e4dcd5cf7fd?auto=format&fit=crop&w=1200&q=80"
                alt="Ethnic edit"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, subtitle, products }: { title: string; subtitle?: string; products: Product[] }) {
  return (
    <section className="container-x py-10 md:py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
