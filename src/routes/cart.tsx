import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useProducts } from "@/lib/products-db";
import { useCart } from "@/store/cart";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — Atelier" },
      { name: "description", content: "Review your bag and proceed to checkout." },
      { property: "og:title", content: "Your bag — Atelier" },
      { property: "og:description", content: "Review your bag and proceed to checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, updateQty, removeLine, subtotal, discount, delivery, total } = useCart();
  const { data: products } = useProducts();

  if (lines.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Your bag is empty</h1>
        <p className="mt-2 text-muted-foreground">Add a piece or two — free shipping over ₹1,999.</p>
        <Button asChild className="mt-6"><Link to="/">Continue shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <h1 className="font-display text-3xl md:text-4xl font-semibold">Your bag</h1>
      <p className="mt-1 text-sm text-muted-foreground">{lines.length} {lines.length === 1 ? "item" : "items"}</p>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-6">
          {lines.map((l) => {
            const p = (products ?? []).find((x) => x.id === l.productId);
            if (!p) return null;
            return (
              <div key={`${l.productId}-${l.size}`} className="flex gap-4 border-b pb-6">
                <Link to="/product/$slug" params={{ slug: p.slug }} className="w-24 md:w-28 shrink-0">
                  <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted">
                    <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.brand}</div>
                      <Link to="/product/$slug" params={{ slug: p.slug }} className="font-medium line-clamp-1 hover:underline">
                        {p.title}
                      </Link>
                      {l.size && <div className="mt-1 text-xs text-muted-foreground">Size: {l.size}</div>}
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="font-semibold">{inr(p.price * l.qty)}</div>
                      {p.mrp > p.price && (
                        <div className="text-xs text-muted-foreground line-through">{inr(p.mrp * l.qty)}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-md border">
                      <button className="p-2" onClick={() => updateQty(l.productId, l.size, l.qty - 1)} aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="min-w-8 text-center text-sm">{l.qty}</span>
                      <button className="p-2" onClick={() => updateQty(l.productId, l.size, l.qty + 1)} aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button
                      onClick={() => removeLine(l.productId, l.size)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-20 h-max rounded-lg border p-6">
          <div className="font-semibold">Order summary</div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal (MRP)</dt><dd>{inr(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="text-[color:var(--sale)]">−{inr(discount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd>{delivery === 0 ? "Free" : inr(delivery)}</dd></div>
          </dl>
          <div className="mt-4 border-t pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{inr(total)}</span>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground text-center">Taxes included. Free shipping over ₹1,999.</p>
        </aside>
      </div>
    </div>
  );
}
