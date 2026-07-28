import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EMPTY_PRODUCT } from "@/lib/admin-products";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/_admin/admin/products/new")({
  head: () => ({ meta: [{ title: "New product — Atelier admin" }, { name: "robots", content: "noindex" }] }),
  component: NewProductPage,
});

function NewProductPage() {
  const nav = useNavigate();
  return (
    <div className="container-x py-10">
      <Link to="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">← Back to products</Link>
      <h1 className="mt-2 font-display text-3xl font-semibold">New product</h1>

      <div className="mt-6 rounded-lg border bg-background p-6">
        <ProductForm
          initial={EMPTY_PRODUCT}
          submitLabel="Create product"
          onSubmit={async (values) => {
            const { error } = await supabase.from("products").insert(values as never);
            if (error) { toast.error(error.message); return; }
            toast.success("Product created");
            nav({ to: "/admin/products" });
          }}
        />
      </div>
    </div>
  );
}
