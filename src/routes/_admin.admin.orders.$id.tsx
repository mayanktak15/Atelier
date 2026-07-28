import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_admin/admin/orders/$id")({
  head: () => ({ meta: [{ title: "Order detail — Atelier admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrderDetailPage,
});

interface OrderDetail {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Record<string, unknown>;
  total: number;
  status: string;
  notes: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

const STATUS_FLOW = ["pending", "processing", "shipped", "delivered", "cancelled"];

function AdminOrderDetailPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: o, error: eO }, { data: it, error: eI }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", id).maybeSingle(),
      supabase.from("order_items").select("*").eq("order_id", id),
    ]);
    if (eO) toast.error(eO.message);
    if (eI) toast.error(eI.message);
    setOrder((o as OrderDetail) ?? null);
    setItems((it ?? []) as OrderItem[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [id]);

  async function updateStatus(next: string) {
    setSaving(true);
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order marked ${next}`);
    setOrder((o) => (o ? { ...o, status: next } : o));
  }

  if (loading) return <div className="container-x py-10 text-sm text-muted-foreground">Loading…</div>;
  if (!order) return <div className="container-x py-10 text-sm text-muted-foreground">Order not found.</div>;

  const addr = order.shipping_address ?? {};

  return (
    <div className="container-x py-10 space-y-6">
      <Link to="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">← Back to orders</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{order.order_number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleString()} · Total ₹{order.total.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-lg border bg-background p-4 min-w-[240px]">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Status</div>
          <div className="mt-1 font-medium capitalize">{order.status}</div>
          <div className="mt-3 flex flex-wrap gap-1">
            {STATUS_FLOW.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={order.status === s ? "default" : "outline"}
                onClick={() => updateStatus(s)}
                disabled={saving || order.status === s}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-background p-6">
          <h2 className="font-display text-lg font-semibold">Customer</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <Row label="Name" value={order.customer_name || "—"} />
            <Row label="Email" value={order.customer_email || "—"} />
            <Row label="Phone" value={order.customer_phone || "—"} />
            <Row label="User ID" value={order.user_id ?? "Guest"} />
          </dl>
        </div>
        <div className="rounded-lg border bg-background p-6">
          <h2 className="font-display text-lg font-semibold">Shipping address</h2>
          <div className="mt-3 text-sm whitespace-pre-wrap">
            {Object.keys(addr).length === 0
              ? "—"
              : Object.entries(addr).map(([k, v]) => `${k}: ${String(v)}`).join("\n")}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background">
        <div className="p-6 pb-3">
          <h2 className="font-display text-lg font-semibold">Line items</h2>
        </div>
        <div className="grid grid-cols-[1.6fr_0.5fr_0.5fr_0.5fr_0.6fr] gap-4 px-6 py-2 text-xs uppercase tracking-widest text-muted-foreground border-b">
          <div>Product</div><div>Size</div><div>Color</div><div>Qty</div><div className="text-right">Line total</div>
        </div>
        {items.length === 0 ? (
          <div className="px-6 py-6 text-sm text-muted-foreground">No line items.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="grid grid-cols-[1.6fr_0.5fr_0.5fr_0.5fr_0.6fr] gap-4 px-6 py-3 text-sm border-b last:border-0">
              <div>
                <div className="font-medium">{it.product_title || it.product_id}</div>
                <div className="text-xs text-muted-foreground">₹{it.price.toLocaleString("en-IN")} each</div>
              </div>
              <div>{it.size || "—"}</div>
              <div>{it.color || "—"}</div>
              <div>{it.quantity}</div>
              <div className="text-right">₹{(it.price * it.quantity).toLocaleString("en-IN")}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 text-muted-foreground">{label}</dt>
      <dd className="flex-1">{value}</dd>
    </div>
  );
}
