import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { discountPct, type Product } from "@/lib/mock-data";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FALLBACK_IMAGE, handleImgError } from "@/lib/image-fallback";

export function ProductCard({ product }: { product: Product }) {
  const [hover, setHover] = useState(false);
  const [wish, setWish] = useState(false);
  const off = discountPct(product);

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
        <img
          src={product.images[hover && product.images[1] ? 1 : 0] || FALLBACK_IMAGE}
          alt={product.title}
          loading="lazy"
          onError={handleImgError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-sm bg-background/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            −{off}%
          </span>
        )}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={(e) => { e.preventDefault(); setWish((w) => !w); }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur transition hover:bg-background"
        >
          <Heart className={cn("h-4 w-4 transition", wish ? "fill-accent text-accent" : "text-foreground")} />
        </button>
      </div>
      <div className="mt-3 space-y-1">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{product.brand}</div>
        <div className="line-clamp-1 text-sm font-medium">{product.title}</div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm font-semibold">{inr(product.price)}</span>
          {off > 0 && <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>}
          {off > 0 && <span className="text-xs font-medium text-[color:var(--sale)]">{off}% off</span>}
        </div>
        <div className="flex items-center gap-1 pt-0.5 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-current text-foreground" />
          <span className="text-foreground">{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
