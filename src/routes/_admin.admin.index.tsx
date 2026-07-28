import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Atelier" },
      { name: "description", content: "Atelier admin dashboard." },
      { property: "og:title", content: "Admin dashboard — Atelier" },
      { property: "og:description", content: "Atelier admin dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

interface Stats {
  products: number;
  orders: number;
  revenue: number;
  recent: { id: string; order_number: string; total: number; status: string; created_at: string; customer_name: string }[];
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, o, rev, recent] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase.from("orders").select("id, order_number, total, status, created_at, customer_name").order("created_at", { ascending: false }).limit(6),
      ]);
      const revenue = (rev.data ?? []).reduce((s, r: { total: number }) => s + (r.total ?? 0), 0);
      setStats({
        products: p.count ?? 0,
        orders: o.count ?? 0,
        revenue,
        recent: (recent.data ?? []) as Stats["recent"],
      });
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Live overview of your storefront.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Products" value={loading ? "…" : stats?.products ?? 0} />
        <Stat label="Orders" value={loading ? "…" : stats?.orders ?? 0} />
        <Stat label="Revenue" value={loading ? "…" : `₹${(stats?.revenue ?? 0).toLocaleString("en-IN")}`} />
      </div>

      <div className="mt-10 rounded-lg border bg-background p-6">
        <h2 className="font-display text-xl font-semibold">Recent orders</h2>
        {loading ? (
          <div className="mt-4 text-sm text-muted-foreground">Loading…</div>
        ) : (stats?.recent.length ?? 0) === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="mt-4 divide-y">
            {stats!.recent.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{o.order_number}</div>
                  <div className="text-muted-foreground text-xs">
                    {o.customer_name || "—"} · {new Date(o.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div>₹{o.total.toLocaleString("en-IN")}</div>
                  <div className="text-xs text-muted-foreground capitalize">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background p-6">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}
