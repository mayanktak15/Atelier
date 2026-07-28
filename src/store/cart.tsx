import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/lib/products-db";
import { useAuth } from "@/store/auth";

export interface CartLine {
  productId: string;
  size: string;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  recentlyViewed: string[];
  addLine: (productId: string, size: string, qty?: number) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  removeLine: (productId: string, size: string) => void;
  clear: () => void;
  logView: (productId: string) => void;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  count: number;
  loading: boolean;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "atelier.cart.v1";
const VIEW_STORAGE = "atelier.views.v1";

function readLocal(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(lines));
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [lines, setLines] = useState<CartLine[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  const mergedRef = useRef<Set<string>>(new Set());

  // Recently viewed — always localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem(VIEW_STORAGE);
      if (v) setRecentlyViewed(JSON.parse(v));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(VIEW_STORAGE, JSON.stringify(recentlyViewed)); } catch {}
  }, [recentlyViewed]);

  // Fetch server cart for a user
  const fetchServerCart = useCallback(async (uid: string): Promise<CartLine[]> => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("product_id, size, quantity")
      .eq("user_id", uid);
    if (error || !data) return [];
    return data.map((r) => ({ productId: r.product_id, size: r.size ?? "", qty: r.quantity }));
  }, []);

  // Merge guest local cart into server cart (once per user per session)
  const mergeGuestIntoServer = useCallback(async (uid: string) => {
    if (mergedRef.current.has(uid)) return;
    mergedRef.current.add(uid);
    const local = readLocal();
    if (local.length === 0) return;

    // Fetch current server rows to sum quantities
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, product_id, size, quantity")
      .eq("user_id", uid);

    const byKey = new Map<string, { id: string; quantity: number }>();
    for (const r of existing ?? []) {
      byKey.set(`${r.product_id}::${r.size ?? ""}`, { id: r.id, quantity: r.quantity });
    }

    for (const line of local) {
      const key = `${line.productId}::${line.size}`;
      const match = byKey.get(key);
      if (match) {
        await supabase
          .from("cart_items")
          .update({ quantity: match.quantity + line.qty })
          .eq("id", match.id);
      } else {
        await supabase.from("cart_items").insert({
          user_id: uid,
          product_id: line.productId,
          size: line.size,
          quantity: line.qty,
        });
      }
    }
    try { localStorage.removeItem(STORAGE); } catch {}
  }, []);

  // Load lines whenever auth state resolves / changes
  useEffect(() => {
    if (authLoading) return;
    const prev = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    let cancelled = false;
    async function run() {
      setLoading(true);
      if (userId) {
        // Signed-in: if this is a fresh transition from guest → user, merge first
        if (prev === null || prev === undefined) {
          await mergeGuestIntoServer(userId);
        }
        const server = await fetchServerCart(userId);
        if (!cancelled) setLines(server);
      } else {
        // Signed-out (or initial guest): read localStorage
        if (prev) {
          // Just signed out — clear in-memory, don't touch DB rows, start fresh local
          setLines([]);
        } else {
          setLines(readLocal());
        }
      }
      if (!cancelled) setLoading(false);
    }
    void run();
    return () => { cancelled = true; };
  }, [userId, authLoading, fetchServerCart, mergeGuestIntoServer]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (authLoading || userId) return;
    writeLocal(lines);
  }, [lines, userId, authLoading]);

  const addLine = useCallback((productId: string, size: string, qty = 1) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === productId && l.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { productId, size, qty }];
    });
    if (userId) {
      void (async () => {
        const { data: existing } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", userId)
          .eq("product_id", productId)
          .eq("size", size || "")
          .maybeSingle();
        if (existing) {
          await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + qty })
            .eq("id", existing.id);
        } else {
          await supabase.from("cart_items").insert({
            user_id: userId,
            product_id: productId,
            size: size,
            quantity: qty,
          });
        }
      })();
    }
  }, [userId]);

  const updateQty = useCallback((productId: string, size: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.productId === productId && l.size === size ? { ...l, qty } : l))
        .filter((l) => l.qty > 0),
    );
    if (userId) {
      void (async () => {
        if (qty <= 0) {
          await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId)
            .eq("size", size || "");
        } else {
          await supabase
            .from("cart_items")
            .update({ quantity: qty })
            .eq("user_id", userId)
            .eq("product_id", productId)
            .eq("size", size || "");
        }
      })();
    }
  }, [userId]);

  const removeLine = useCallback((productId: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.size === size)));
    if (userId) {
      void supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
        .eq("size", size || "");
    }
  }, [userId]);

  const clear = useCallback(() => {
    setLines([]);
    if (userId) {
      void supabase.from("cart_items").delete().eq("user_id", userId);
    } else {
      writeLocal([]);
    }
  }, [userId]);

  const logView = useCallback((productId: string) => {
    setRecentlyViewed((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, 10);
      return next;
    });
  }, []);

  const { data: products } = useProducts();
  const { subtotal, discount, delivery, total, count } = useMemo(() => {
    const map = new Map((products ?? []).map((p) => [p.id, p]));
    let subtotal = 0;
    let discount = 0;
    let count = 0;
    for (const l of lines) {
      const p = map.get(l.productId);
      if (!p) continue;
      subtotal += p.mrp * l.qty;
      discount += (p.mrp - p.price) * l.qty;
      count += l.qty;
    }
    const merch = subtotal - discount;
    const delivery = merch === 0 ? 0 : merch >= 1999 ? 0 : 99;
    return { subtotal, discount, delivery, total: merch + delivery, count };
  }, [lines, products]);

  return (
    <Ctx.Provider value={{ lines, recentlyViewed, addLine, updateQty, removeLine, clear, logView, subtotal, discount, delivery, total, count, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
