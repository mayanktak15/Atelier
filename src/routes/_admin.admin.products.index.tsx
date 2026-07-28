import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { seedProductsFromMock, type ProductRow } from "@/lib/admin-products";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_admin/admin/products/")({
  head: () => ({ meta: [{ title: "Products — Atelier admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminProductsPage,
});

const PAGE_SIZE = 15;

function AdminProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [seeding, setSeeding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null);

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as ProductRow[]);
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      r.title.toLowerCase().includes(term) ||
      r.slug.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term) ||
      r.brand.toLowerCase().includes(term),
    );
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleSeed() {
    setSeeding(true);
    try {
      const n = await seedProductsFromMock();
      toast.success(`Imported ${n} products from demo catalog`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setSeeding(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("products").delete().eq("id", pendingDelete.id);
    if (error) toast.error(error.message);
    else { toast.success("Product deleted"); await refresh(); }
    setPendingDelete(null);
  }

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your product catalog.</p>
        </div>
        <div className="flex gap-2">
          {rows.length === 0 && (
            <Button variant="outline" onClick={handleSeed} disabled={seeding}>
              {seeding ? "Importing…" : "Import demo catalog"}
            </Button>
          )}
          <Button asChild>
            <Link to="/admin/products/new">New product</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Input
          placeholder="Search title, slug, brand, category…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</div>
      </div>

      <div className="mt-4 rounded-lg border bg-background overflow-hidden">
        <div className="grid grid-cols-[64px_1.6fr_0.8fr_0.8fr_0.5fr_0.5fr_auto] gap-4 px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground border-b">
          <div>Image</div><div>Title</div><div>Category</div><div>Brand</div><div>Price</div><div>Stock</div><div className="w-28 text-right">Actions</div>
        </div>
        {loading ? (
          <div className="px-4 py-10 text-sm text-muted-foreground">Loading…</div>
        ) : paged.length === 0 ? (
          <div className="px-4 py-10 text-sm text-muted-foreground">
            No products yet. {rows.length === 0 && "Click \"Import demo catalog\" or \"New product\" to begin."}
          </div>
        ) : (
          paged.map((p) => (
            <div key={p.id} className="grid grid-cols-[64px_1.6fr_0.8fr_0.8fr_0.5fr_0.5fr_auto] gap-4 px-4 py-3 items-center text-sm border-b last:border-0">
              <div className="h-12 w-12 rounded bg-muted overflow-hidden">
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground truncate">{p.slug}</div>
              </div>
              <div className="capitalize">{p.category}</div>
              <div className="truncate">{p.brand}</div>
              <div>₹{p.price.toLocaleString("en-IN")}</div>
              <div>{p.stock}</div>
              <div className="w-28 flex justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/products/$id" params={{ id: p.id }}>Edit</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPendingDelete(p)}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.title}" will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
