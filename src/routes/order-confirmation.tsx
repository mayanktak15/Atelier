import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Order confirmed — Atelier" },
      { name: "description", content: "Thanks for your order." },
      { property: "og:title", content: "Order confirmed — Atelier" },
      { property: "og:description", content: "Thanks for your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

interface OrderSummary {
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  shipping_address: unknown;
}

function Confirmation() {
  const { id } = Route.useSearch();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("order_number, total, status, created_at, shipping_address")
        .eq("order_number", id)
        .maybeSingle();
      if (!cancelled) {
        setOrder(data as OrderSummary | null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const eta = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="container-x py-16 max-w-2xl mx-auto text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--success)]/10">
        <CheckCircle2 className="h-8 w-8 text-[color:var(--success)]" />
      </div>
      <h1 className="mt-6 font-display text-3xl md:text-4xl font-semibold">Order confirmed</h1>
      <p className="mt-3 text-muted-foreground">
        Thanks for shopping with Atelier. Your order is now being prepared.
      </p>

      <div className="mt-8 rounded-lg border p-6 text-left">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading order…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Order ID</div>
              <div className="font-medium mt-0.5">{order?.order_number ?? id ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Estimated delivery</div>
              <div className="font-medium mt-0.5">by {eta}</div>
            </div>
            {order && (
              <>
                <div>
                  <div className="text-muted-foreground text-xs">Total</div>
                  <div className="font-medium mt-0.5">{inr(order.total)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Status</div>
                  <div className="font-medium mt-0.5 capitalize">{order.status}</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Button asChild><Link to="/orders">View orders</Link></Button>
        <Button asChild variant="outline"><Link to="/">Continue shopping</Link></Button>
      </div>
    </div>
  );
}
