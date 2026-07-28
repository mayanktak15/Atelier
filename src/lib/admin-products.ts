import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS } from "@/lib/mock-data";

export interface ProductRow {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  mrp: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  material: string;
  tags: string[];
  stock: number;
  trending: boolean;
  rating: number;
  review_count: number;
  created_at?: string;
  updated_at?: string;
}

export const EMPTY_PRODUCT: Omit<ProductRow, "id"> = {
  slug: "",
  title: "",
  brand: "",
  category: "women",
  subcategory: "",
  price: 0,
  mrp: 0,
  images: [],
  sizes: [],
  colors: [],
  description: "",
  material: "",
  tags: [],
  stock: 0,
  trending: false,
  rating: 0,
  review_count: 0,
};

export async function seedProductsFromMock() {
  const rows = PRODUCTS.map((p) => ({
    slug: p.slug,
    title: p.title,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    mrp: p.mrp,
    images: p.images,
    sizes: p.sizes,
    colors: p.colors,
    description: p.description,
    material: p.material,
    tags: p.tags,
    stock: p.stock,
    trending: p.trending ?? false,
    rating: p.rating,
    review_count: p.reviewCount,
  }));
  const { error, count } = await supabase
    .from("products")
    .upsert(rows as never, { onConflict: "slug", count: "exact" });
  if (error) throw error;
  return count ?? rows.length;
}
