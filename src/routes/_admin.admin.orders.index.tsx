import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/orders/")({
  head: () => ({ meta: [{ title: "Orders — Atelier admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrdersPage,
});

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;

function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_email, total, status, created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setRows((data ?? []) as OrderRow[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!term) return true;
      return (
        r.order_number.toLowerCase().includes(term) ||
        r.customer_name.toLowerCase().includes(term) ||
        r.customer_email.toLowerCase().includes(term)
      );
    });
  }, [rows, status, q]);

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage customer orders and fulfillment.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search order #, customer, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
        <div className="text-sm text-muted-foreground ml-auto">{filtered.length} order{filtered.length === 1 ? "" : "s"}</div>
      </div>

      <div className="mt-4 rounded-lg border bg-background overflow-hidden">
        <div className="grid grid-cols-[1fr_1.4fr_1fr_0.8fr_0.8fr_auto] gap-4 px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground border-b">
          <div>Order #</div><div>Customer</div><div>Date</div><div>Total</div><div>Status</div><div className="w-16"></div>
        </div>
        {loading ? (
          <div className="px-4 py-10 text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-10 text-sm text-muted-foreground">No orders match.</div>
        ) : (
          filtered.map((o) => (
            <div key={o.id} className="grid grid-cols-[1fr_1.4fr_1fr_0.8fr_0.8fr_auto] gap-4 px-4 py-3 items-center text-sm border-b last:border-0">
              <div className="font-medium">{o.order_number}</div>
              <div className="min-w-0">
                <div className="truncate">{o.customer_name || "—"}</div>
                <div className="text-xs text-muted-foreground truncate">{o.customer_email}</div>
              </div>
              <div className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
              <div>₹{o.total.toLocaleString("en-IN")}</div>
              <div><StatusBadge status={o.status} /></div>
              <div className="w-16 text-right">
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/orders/$id" params={{ id: o.id }}>View</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    processing: "bg-blue-100 text-blue-900",
    shipped: "bg-indigo-100 text-indigo-900",
    delivered: "bg-emerald-100 text-emerald-900",
    cancelled: "bg-red-100 text-red-900",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs capitalize ${styles[status] ?? "bg-muted text-foreground"}`}>
      {status}
    </span>
  );
}
