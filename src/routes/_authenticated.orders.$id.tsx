import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Circle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order — Atelier` },
      { name: "description", content: "Order details and tracking." },
      { property: "og:title", content: `Order ${params.id} — Atelier` },
      { property: "og:description", content: "Order details and tracking." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderDetail,
});

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}
interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: unknown;
  order_items: OrderItem[];
}

const TIMELINE = ["pending", "processing", "shipped", "delivered"] as const;
const LABELS: Record<string, string> = {
  pending: "Placed",
  processing: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

function formatAddress(a: unknown): string {
  if (!a || typeof a !== "object") return "";
  const o = a as Record<string, unknown>;
  const parts = [o.name, o.line, o.city, o.state, o.pincode].filter((x) => typeof x === "string" && x);
  return parts.join(", ");
}

function OrderDetail() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at, customer_name, customer_phone, shipping_address, order_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (!data) setNotFoundFlag(true);
      setOrder(data as OrderRow | null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <div className="container-x py-24 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>;
  }
  if (notFoundFlag || !order) throw notFound();

  const currentStep = order.status === "cancelled" ? -1 : TIMELINE.indexOf(order.status as (typeof TIMELINE)[number]);
  const canCancel = order.status === "pending" || order.status === "processing";

  async function cancelOrder() {
    if (!order) return;
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOrder({ ...order, status: "cancelled" });
    toast.success("Order cancelled");
  }

  return (
    <div className="container-x py-8 max-w-4xl">
      <Link to="/orders" className="text-xs text-muted-foreground hover:text-foreground">← All orders</Link>
      <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold">Order {order.order_number}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-8 rounded-lg border p-6">
        {order.status === "cancelled" ? (
          <div className="flex items-center gap-3 text-destructive">
            <XCircle className="h-5 w-5" /> This order was cancelled.
          </div>
        ) : (
          <ol className="flex items-center justify-between">
            {TIMELINE.map((step, i) => {
              const done = i <= currentStep;
              return (
                <li key={step} className="flex-1 flex flex-col items-center relative">
                  <div className={cn(
                    "z-10 grid h-8 w-8 place-items-center rounded-full border-2 bg-background",
                    done ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground",
                  )}>
                    {done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                  </div>
                  <div className={cn("mt-2 text-xs", done ? "font-medium text-foreground" : "text-muted-foreground")}>{LABELS[step]}</div>
                  {i < TIMELINE.length - 1 && (
                    <div className={cn("absolute top-4 left-1/2 w-full h-0.5", i < currentStep ? "bg-foreground" : "bg-border")} />
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-6 rounded-lg border">
        {order.order_items.map((it) => (
          <div key={it.id} className="flex items-center gap-4 p-4 border-b last:border-b-0">
            <div className="flex-1 min-w-0 text-sm">
              <div className="font-medium">{it.product_title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {it.size && `Size ${it.size} · `}Qty {it.quantity}
              </div>
            </div>
            <div className="font-medium">{inr(it.price * it.quantity)}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-5 text-sm">
          <div className="font-medium">Shipping address</div>
          <div className="mt-2 text-muted-foreground">{formatAddress(order.shipping_address) || order.customer_name}</div>
          {order.customer_phone && <div className="text-muted-foreground text-xs mt-1">{order.customer_phone}</div>}
        </div>
        <div className="rounded-lg border p-5 text-sm">
          <div className="font-medium">Total</div>
          <div className="mt-2 text-2xl font-semibold">{inr(order.total)}</div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        {canCancel && (
          <Button variant="outline" onClick={cancelOrder}>Cancel order</Button>
        )}
        <Button variant="outline" onClick={() => toast.info("Invoice will be emailed (demo)")}>Download invoice</Button>
      </div>
    </div>
  );
}
