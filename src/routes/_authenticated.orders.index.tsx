import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/auth";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — Atelier" },
      { name: "description", content: "Track and manage your Atelier orders." },
      { property: "og:title", content: "My orders — Atelier" },
      { property: "og:description", content: "Track and manage your Atelier orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Orders,
});

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { id: string; product_title: string; quantity: number }[];
}

const statusColor: Record<string, string> = {
  pending: "bg-muted text-foreground",
  processing: "bg-muted text-foreground",
  shipped: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  delivered: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
  cancelled: "bg-destructive/10 text-destructive",
};

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at, order_items(id, product_title, quantity)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setOrders((data ?? []) as OrderRow[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="container-x py-8 max-w-4xl">
      <h1 className="font-display text-3xl md:text-4xl font-semibold">My orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track your recent orders and their status.</p>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="text-center py-12"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground" />
            <div className="mt-4 font-display text-xl">No orders yet</div>
            <p className="mt-2 text-sm text-muted-foreground">When you place an order it'll appear here.</p>
            <Button asChild className="mt-4"><Link to="/">Start shopping</Link></Button>
          </div>
        ) : (
          orders.map((o) => (
            <Link
              key={o.id}
              to="/orders/$id"
              params={{ id: o.id }}
              className="block rounded-lg border p-5 hover:bg-muted/30 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Order · {o.order_number}</div>
                  <div className="text-xs text-muted-foreground">
                    Placed on {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium capitalize", statusColor[o.status] ?? "bg-muted")}>
                  {o.status}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 min-w-0 text-sm">
                  <div className="line-clamp-1">
                    {o.order_items.map((it) => it.product_title).filter(Boolean).join(" · ")}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {o.order_items.length} {o.order_items.length === 1 ? "item" : "items"}
                  </div>
                </div>
                <div className="font-semibold">{inr(o.total)}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
