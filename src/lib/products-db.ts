import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, type Product, type Category } from "@/lib/mock-data";

// Raw DB row (jsonb fields come as unknown)
interface ProductRow {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  mrp: number;
  images: unknown;
  sizes: unknown;
  colors: unknown;
  description: string;
  material: string;
  tags: unknown;
  stock: number;
  trending: boolean;
  rating: number;
  review_count: number;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}
function asColorArray(v: unknown): { name: string; hex: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((c) => (c && typeof c === "object" ? (c as { name?: unknown; hex?: unknown }) : null))
    .filter((c): c is { name?: unknown; hex?: unknown } => c !== null)
    .map((c) => ({
      name: typeof c.name === "string" ? c.name : "",
      hex: typeof c.hex === "string" ? c.hex : "#cccccc",
    }))
    .filter((c) => c.name);
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    brand: row.brand,
    category: row.category as Category,
    subcategory: row.subcategory,
    price: Number(row.price) || 0,
    mrp: Number(row.mrp) || 0,
    images: asStringArray(row.images),
    sizes: asStringArray(row.sizes),
    colors: asColorArray(row.colors),
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    description: row.description,
    material: row.material,
    tags: asStringArray(row.tags),
    stock: Number(row.stock) || 0,
    trending: row.trending,
  };
}

export const PRODUCTS_QUERY_KEY = ["products", "all"] as const;

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, title, brand, category, subcategory, price, mrp, images, sizes, colors, description, material, tags, stock, trending, rating, review_count")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return PRODUCTS;
    return data.map((r) => mapProductRow(r as unknown as ProductRow));
  } catch (err) {
    console.warn("Failed to fetch products from Supabase, using mock fallback:", err);
    return PRODUCTS;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, title, brand, category, subcategory, price, mrp, images, sizes, colors, description, material, tags, stock, trending, rating, review_count")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return PRODUCTS.find((p) => p.slug === slug) ?? null;
    return mapProductRow(data as unknown as ProductRow);
  } catch (err) {
    console.warn("Failed to fetch product by slug from Supabase, using mock fallback:", err);
    return PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: fetchAllProducts,
    staleTime: 30_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["products", "slug", slug],
    queryFn: () => fetchProductBySlug(slug),
    staleTime: 30_000,
  });
}
