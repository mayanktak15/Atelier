import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-db";
import { ProductGrid } from "@/components/ProductCard";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/$category")({
  loader: ({ params }) => {
    if (!CATEGORIES.some((c) => c.slug === params.category)) throw notFound();
    return { category: params.category as Category };
  },
  head: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === (params.category as Category));
    const label = cat?.label ?? "Shop";
    return {
      meta: [
        { title: `${label} — Atelier` },
        { name: "description", content: `Shop ${label.toLowerCase()} at Atelier: thoughtfully made pieces in premium fabrics.` },
        { property: "og:title", content: `${label} — Atelier` },
        { property: "og:description", content: `Shop ${label.toLowerCase()} at Atelier.` },
      ],
    };
  },
  component: ShopCategory,
});

type SortKey = "featured" | "new" | "priceLow" | "priceHigh" | "discount" | "rating";

function ShopCategory() {
  const { category } = Route.useLoaderData() as { category: Category };
  return <ShopView category={category} />;
}

export function ShopView({ category }: { category?: Category }) {
  const label = category ? CATEGORIES.find((c) => c.slug === category)!.label : "All";
  const { data: products, isLoading } = useProducts();

  const all = useMemo(
    () => (category ? (products ?? []).filter((p) => p.category === category) : (products ?? [])),
    [products, category],
  );

  const sizeOptions = useMemo(
    () => Array.from(new Set(all.flatMap((p) => p.sizes))).slice(0, 24),
    [all],
  );
  const brandOptions = useMemo(
    () => Array.from(new Set(all.map((p) => p.brand))).sort(),
    [all],
  );
  const colorOptions = useMemo(() => {
    const m = new Map<string, string>();
    all.forEach((p) => p.colors.forEach((c) => m.set(c.name, c.hex)));
    return Array.from(m.entries()).map(([name, hex]) => ({ name, hex }));
  }, [all]);
  const maxPrice = useMemo(
    () => (all.length ? Math.ceil(Math.max(...all.map((p) => p.price)) / 500) * 500 : 10000),
    [all],
  );

  const [sort, setSort] = useState<SortKey>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [minDiscount, setMinDiscount] = useState(0);

  // Sync price range with dataset when it loads
  useEffect(() => {
    setPriceRange(([lo, hi]) => (hi === 0 || hi > maxPrice ? [0, maxPrice] : [lo, hi]));
  }, [maxPrice]);

  const filtered = useMemo(() => {
    let list = all.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sizes.length) list = list.filter((p) => p.sizes.some((s) => sizes.includes(s)));
    if (brands.length) list = list.filter((p) => brands.includes(p.brand));
    if (colors.length) list = list.filter((p) => p.colors.some((c) => colors.includes(c.name)));
    if (minDiscount > 0) {
      list = list.filter((p) => Math.round(((p.mrp - p.price) / p.mrp) * 100) >= minDiscount);
    }
    switch (sort) {
      case "priceLow": list = [...list].sort((a, b) => a.price - b.price); break;
      case "priceHigh": list = [...list].sort((a, b) => b.price - a.price); break;
      case "discount": list = [...list].sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "new": list = [...list].reverse(); break;
    }
    return list;
  }, [all, priceRange, sizes, brands, colors, minDiscount, sort]);

  const activeCount =
    (sizes.length ? 1 : 0) + (brands.length ? 1 : 0) + (colors.length ? 1 : 0) +
    (minDiscount ? 1 : 0) + (priceRange[0] !== 0 || priceRange[1] !== maxPrice ? 1 : 0);

  const clearAll = () => {
    setSizes([]); setBrands([]); setColors([]);
    setMinDiscount(0); setPriceRange([0, maxPrice]);
  };

  const Filters = (
    <div className="space-y-8">
      <div>
        <div className="mb-3 text-sm font-semibold">Price</div>
        <Slider
          value={priceRange}
          min={0}
          max={maxPrice}
          step={100}
          onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSizes((v) => v.includes(s) ? v.filter((x) => x !== s) : [...v, s])}
              className={cn(
                "min-w-10 rounded-md border px-3 py-1.5 text-xs transition",
                sizes.includes(s) ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted",
              )}
            >{s}</button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="space-y-2">
          {brandOptions.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={brands.includes(b)}
                onCheckedChange={() =>
                  setBrands((v) => v.includes(b) ? v.filter((x) => x !== b) : [...v, b])}
              />
              {b}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <button
              key={c.name}
              onClick={() => setColors((v) => v.includes(c.name) ? v.filter((x) => x !== c.name) : [...v, c.name])}
              title={c.name}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition",
                colors.includes(c.name) ? "border-foreground ring-2 ring-offset-2 ring-offset-background ring-foreground" : "border-border",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Discount">
        <div className="space-y-2">
          {[10, 25, 40, 50].map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={minDiscount === d}
                onCheckedChange={() => setMinDiscount((cur) => cur === d ? 0 : d)}
              />
              {d}% and above
            </label>
          ))}
        </div>
      </FilterGroup>

      {activeCount > 0 && (
        <Button variant="ghost" className="w-full" onClick={clearAll}>
          <X className="h-4 w-4 mr-1" /> Clear all
        </Button>
      )}
    </div>
  );

  return (
    <div className="container-x py-8">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{label}</span>
      </nav>

      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
                {activeCount > 0 && <span className="ml-1 rounded-full bg-accent text-accent-foreground px-1.5 text-[10px]">{activeCount}</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto p-6">
              <SheetTitle className="mb-4">Filters</SheetTitle>
              {Filters}
            </SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="new">New arrivals</SelectItem>
              <SelectItem value="priceLow">Price: Low to High</SelectItem>
              <SelectItem value="priceHigh">Price: High to Low</SelectItem>
              <SelectItem value="discount">Discount</SelectItem>
              <SelectItem value="rating">Customer rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden lg:block">{Filters}</aside>
        <div>
          {isLoading ? (
            <div className="rounded-lg border border-dashed p-16 text-center">
              <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
              <div className="mt-3 text-sm text-muted-foreground">Loading products…</div>
            </div>
          ) : all.length === 0 ? (
            <div className="rounded-lg border border-dashed p-16 text-center">
              <div className="font-display text-xl">No products in the catalog yet.</div>
              <p className="mt-2 text-sm text-muted-foreground">
                An admin can seed the catalog from the admin panel.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/admin">Go to admin</Link>
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-16 text-center">
              <div className="font-display text-xl">No products match your filters.</div>
              <Button variant="outline" className="mt-4" onClick={clearAll}>Clear filters</Button>
            </div>
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}
