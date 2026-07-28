import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { ProductRow } from "@/lib/admin-products";

type FormValue = Omit<ProductRow, "id" | "created_at" | "updated_at">;

interface Props {
  initial: FormValue;
  submitLabel: string;
  onSubmit: (values: FormValue) => Promise<void>;
}

const CATEGORIES = ["women", "men", "kids", "ethnic", "footwear", "accessories"];

export function ProductForm({ initial, submitLabel, onSubmit }: Props) {
  const [v, setV] = useState<FormValue>(initial);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormValue>(k: K, val: FormValue[K]) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  function csvToArr(s: string): string[] {
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(v);
    } finally {
      setSubmitting(false);
    }
  }

  const colorsText = v.colors.map((c) => `${c.name}:${c.hex}`).join(", ");

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title"><Input value={v.title} onChange={(e) => set("title", e.target.value)} required /></Field>
        <Field label="Slug (URL)"><Input value={v.slug} onChange={(e) => set("slug", e.target.value)} required /></Field>
        <Field label="Brand"><Input value={v.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
        <Field label="Category">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={v.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Subcategory"><Input value={v.subcategory} onChange={(e) => set("subcategory", e.target.value)} /></Field>
        <Field label="Material"><Input value={v.material} onChange={(e) => set("material", e.target.value)} /></Field>
        <Field label="Price (₹)"><Input type="number" value={v.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
        <Field label="MRP (₹)"><Input type="number" value={v.mrp} onChange={(e) => set("mrp", Number(e.target.value))} /></Field>
        <Field label="Stock"><Input type="number" value={v.stock} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
        <Field label="Trending">
          <div className="flex items-center h-10"><Switch checked={v.trending} onCheckedChange={(c) => set("trending", c)} /></div>
        </Field>
      </div>

      <Field label="Description">
        <Textarea rows={4} value={v.description} onChange={(e) => set("description", e.target.value)} />
      </Field>

      <Field label="Images (one URL per line)">
        <Textarea rows={3} value={v.images.join("\n")} onChange={(e) => set("images", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
      </Field>

      <Field label="Sizes (comma-separated)">
        <Input value={v.sizes.join(", ")} onChange={(e) => set("sizes", csvToArr(e.target.value))} />
      </Field>

      <Field label="Colors (comma-separated, format: name:#hex)">
        <Input
          value={colorsText}
          onChange={(e) =>
            set(
              "colors",
              csvToArr(e.target.value).map((pair) => {
                const [name, hex] = pair.split(":").map((x) => x.trim());
                return { name: name ?? "", hex: hex ?? "#000000" };
              }),
            )
          }
          placeholder="Sand:#d9c4a7, Ivory:#f4ecdd"
        />
      </Field>

      <Field label="Tags (comma-separated)">
        <Input value={v.tags.join(", ")} onChange={(e) => set("tags", csvToArr(e.target.value))} />
      </Field>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : submitLabel}</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
