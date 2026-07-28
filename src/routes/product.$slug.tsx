import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Truck, RotateCcw, ShieldCheck, Star, Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { discountPct, MOCK_REVIEWS, type Product } from "@/lib/mock-data";
import { useProducts, useProduct } from "@/lib/products-db";
import { inr } from "@/lib/format";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductGrid } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { handleImgError } from "@/lib/image-fallback";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Atelier` },
      { name: "description", content: "Considered fashion, made to last." },
      { property: "og:title", content: `${params.slug} — Atelier` },
      { property: "og:description", content: "Considered fashion, made to last." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading, isFetched } = useProduct(slug);

  if (isLoading) {
    return (
      <div className="container-x py-24 text-center">
        <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
        <div className="mt-3 text-sm text-muted-foreground">Loading product…</div>
      </div>
    );
  }
  if (isFetched && !product) throw notFound();
  if (!product) return null;

  return <ProductView product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const { addLine, logView } = useCart();
  const { data: allProducts } = useProducts();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const off = discountPct(product);
  const related = (allProducts ?? [])
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  useEffect(() => { logView(product.id); }, [product.id, logView]);
  useEffect(() => {
    setSelectedSize(null); setActiveImg(0); setQty(1);
    setSelectedColor(product.colors[0]?.name ?? "");
  }, [product.id, product.colors]);

  const handleAdd = (buyNow = false) => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addLine(product.id, selectedSize ?? "", qty);
    if (buyNow) {
      window.location.href = "/cart";
    } else {
      toast.success("Added to bag", { description: `${product.title}${selectedSize ? ` · Size ${selectedSize}` : ""}` });
    }
  };

  return (
    <div className="container-x py-8">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop/$category" params={{ category: product.category }} className="hover:text-foreground capitalize">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_460px] gap-10">
        <div className="grid grid-cols-[80px_1fr] gap-3">
          <div className="hidden md:flex flex-col gap-2">
            {product.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "aspect-[3/4] overflow-hidden rounded border-2 transition",
                  activeImg === i ? "border-foreground" : "border-transparent",
                )}
              >
                <img src={src} alt="" onError={handleImgError} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="col-start-1 md:col-start-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              {product.images[activeImg] && (
                <img src={product.images[activeImg]} alt={product.title} onError={handleImgError} className="h-full w-full object-cover" />
              )}
              {off > 0 && (
                <span className="absolute left-4 top-4 rounded-sm bg-background/95 px-2 py-1 text-xs font-semibold uppercase tracking-wider">
                  −{off}%
                </span>
              )}
            </div>
            <div className="md:hidden mt-2 flex gap-2 overflow-x-auto">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn("w-16 shrink-0 aspect-[3/4] overflow-hidden rounded border-2",
                    activeImg === i ? "border-foreground" : "border-transparent")}
                >
                  <img src={src} alt="" onError={handleImgError} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">{product.title}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-medium">{product.rating}</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{product.reviewCount} reviews</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{inr(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-muted-foreground line-through">{inr(product.mrp)}</span>
                <span className="text-sm font-medium text-[color:var(--sale)]">Save {off}%</span>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</div>

          {product.colors.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 text-sm">
                <span className="font-medium">Color:</span> <span className="text-muted-foreground">{selectedColor}</span>
              </div>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 transition",
                      selectedColor === c.name
                        ? "border-foreground ring-2 ring-offset-2 ring-offset-background ring-foreground"
                        : "border-border",
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Size</span>
                <Dialog>
                  <DialogTrigger className="text-xs underline text-muted-foreground hover:text-foreground">
                    Size guide
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Size guide</DialogTitle>
                    <div className="mt-4 overflow-hidden rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Size</th>
                            <th className="p-2 text-left">Bust (in)</th>
                            <th className="p-2 text-left">Waist (in)</th>
                            <th className="p-2 text-left">Hip (in)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[["XS","31-33","24-26","34-36"],["S","33-35","26-28","36-38"],["M","35-37","28-30","38-40"],["L","37-39","30-32","40-42"],["XL","39-42","32-35","42-45"]].map((r) => (
                            <tr key={r[0]} className="border-t">{r.map((c) => <td key={c} className="p-2">{c}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Measurements are approximate. Between sizes? We recommend sizing up.</p>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      "min-w-12 rounded-md border px-3 py-2 text-sm transition",
                      selectedSize === s ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted",
                    )}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="mb-2 text-sm font-medium">Quantity</div>
            <div className="inline-flex items-center rounded-md border">
              <button className="p-2" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
              <span className="min-w-10 text-center text-sm">{qty}</span>
              <button className="p-2" onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button onClick={() => handleAdd(false)} size="lg" className="flex-1">Add to bag</Button>
            <Button onClick={() => handleAdd(true)} size="lg" variant="outline" className="flex-1">Buy now</Button>
            <Button variant="outline" size="lg" className="px-3" aria-label="Wishlist"><Heart className="h-4 w-4" /></Button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border p-3 text-center"><Truck className="h-4 w-4 mx-auto mb-1" />Free shipping over ₹1,999</div>
            <div className="rounded-md border p-3 text-center"><RotateCcw className="h-4 w-4 mx-auto mb-1" />30-day returns</div>
            <div className="rounded-md border p-3 text-center"><ShieldCheck className="h-4 w-4 mx-auto mb-1" />Secure checkout</div>
          </div>

          <Accordion type="single" collapsible className="mt-8" defaultValue="desc">
            <AccordionItem value="desc">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{product.description}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="material">
              <AccordionTrigger>Material & care</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {product.material}. Gentle machine wash cold, tumble dry low or line dry in shade. Iron on reverse.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger>Delivery & returns</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Ships in 1–2 business days. Standard delivery in 3–5 business days across India. Free returns within 30 days of delivery.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">Reviews</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {MOCK_REVIEWS.map((r) => (
            <div key={r.id} className="rounded-lg border p-5">
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "fill-current" : "text-muted-foreground/40")} />
                ))}
              </div>
              <p className="text-sm">{r.comment}</p>
              <div className="mt-3 text-xs text-muted-foreground">{r.name} · {r.date}</div>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
