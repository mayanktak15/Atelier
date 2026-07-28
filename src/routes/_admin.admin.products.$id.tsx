import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ProductRow } from "@/lib/admin-products";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_admin/admin/products/$id")({
  head: () => ({ meta: [{ title: "Edit product — Atelier admin" }, { name: "robots", content: "noindex" }] }),
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [row, setRow] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) toast.error(error.message);
      setRow((data as ProductRow) ?? null);
      setLoading(false);
    })();
  }, [id]);

  async function handleDelete() {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    nav({ to: "/admin/products" });
  }

  if (loading) return <div className="container-x py-10 text-sm text-muted-foreground">Loading…</div>;
  if (!row) return <div className="container-x py-10 text-sm text-muted-foreground">Product not found.</div>;

  const { id: _drop, created_at: _c, updated_at: _u, ...initial } = row;
  void _drop; void _c; void _u;

  return (
    <div className="container-x py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">← Back to products</Link>
          <h1 className="mt-2 font-display text-3xl font-semibold">Edit product</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="outline">Delete</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{row.title}"?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mt-6 rounded-lg border bg-background p-6">
        <ProductForm
          initial={initial}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            const { error } = await supabase.from("products").update(values as never).eq("id", id);
            if (error) { toast.error(error.message); return; }
            toast.success("Product updated");
          }}
        />
      </div>
    </div>
  );
}
