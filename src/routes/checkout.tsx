import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ChevronRight, Lock, LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/lib/products-db";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Atelier" },
      { name: "description", content: "Complete your Atelier order — secure checkout." },
      { property: "og:title", content: "Checkout — Atelier" },
      { property: "og:description", content: "Complete your Atelier order — secure checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type Step = 1 | 2 | 3;

interface AddressForm {
  name: string;
  phone: string;
  line: string;
  city: string;
  state: string;
  pincode: string;
}

function generateOrderNumber() {
  const rand = Math.floor(10000 + Math.random() * 89999);
  const year = new Date().getFullYear().toString().slice(-2);
  return `ATL${year}-${rand}`;
}

function Checkout() {
  const nav = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { lines, subtotal, discount, delivery, total, clear } = useCart();
  const { data: products } = useProducts();
  const [step, setStep] = useState<Step>(1);
  const [payment, setPayment] = useState<"card" | "upi" | "cod">("card");
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    name: "", phone: "", line: "", city: "", state: "", pincode: "",
  });

  // Prefill from profile
  useEffect(() => {
    if (profile) {
      setAddress((a) => ({
        ...a,
        name: a.name || profile.name || "",
        phone: a.phone || profile.phone || "",
      }));
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="container-x py-24 text-center">
        <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-x py-24 max-w-md mx-auto text-center">
        <LogIn className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Sign in to check out</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need an account to place an order. Your bag will be saved.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button asChild>
            <Link to="/login" search={{ redirect: "/checkout" } as never}>Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/signup" search={{ redirect: "/checkout" } as never}>Create account</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Nothing to check out</h1>
        <p className="mt-2 text-muted-foreground">Your bag is empty.</p>
        <Button asChild className="mt-6"><Link to="/">Continue shopping</Link></Button>
      </div>
    );
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const addressValid =
    address.name.trim() && address.phone.trim() && address.line.trim() &&
    address.city.trim() && address.state.trim() && address.pincode.trim();

  const placeOrder = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      const orderNumber = generateOrderNumber();
      const shippingAddress = { ...address };

      const itemRows = lines
        .map((l) => {
          const p = productMap.get(l.productId);
          if (!p) return null;
          return {
            product_id: p.id,
            product_title: p.title,
            size: l.size || "",
            color: p.colors[0]?.name ?? "",
            quantity: l.qty,
            price: p.price,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      if (itemRows.length === 0) {
        throw new Error("Your bag is empty.");
      }

      // Single atomic transaction: stock check + decrement + order + items + cart clear.
      // Either everything commits or nothing does (ACID).
      const { data, error } = await supabase.rpc("place_order", {
        p_order_number: orderNumber,
        p_customer_name: address.name,
        p_customer_email: user.email ?? "",
        p_customer_phone: address.phone,
        p_shipping_address: shippingAddress as never,
        p_total: total,
        p_items: itemRows as never,
      });
      if (error) throw error;

      const result = data as
        | { ok: boolean; order_number?: string; shortages?: { title: string; requested: number; available: number }[] }
        | null;

      if (!result || !result.ok) {
        const list = (result?.shortages ?? [])
          .map((s) => `• ${s.title}: requested ${s.requested}, only ${s.available} left`)
          .join("\n");
        toast.error("Some items are out of stock", { description: list || "Please review your bag." });
        return;
      }

      clear();
      toast.success("Order placed!");
      nav({ to: "/order-confirmation", search: { id: result.order_number ?? orderNumber } as never });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-x py-8">
      <h1 className="font-display text-3xl md:text-4xl font-semibold">Checkout</h1>

      <ol className="mt-6 flex items-center gap-2 text-sm">
        {["Address", "Review", "Payment"].map((label, i) => {
          const n = (i + 1) as Step;
          return (
            <li key={label} className="flex items-center gap-2">
              <span className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-xs font-medium",
                step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}>
                {step > n ? <Check className="h-3.5 w-3.5" /> : n}
              </span>
              <span className={cn(step >= n ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
              {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          {step === 1 && (
            <section>
              <h2 className="font-semibold mb-4">Delivery address</h2>
              <div className="rounded-lg border p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field id="name" label="Full name" value={address.name} onChange={(v) => setAddress({ ...address, name: v })} />
                  <Field id="phone" label="Phone" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} />
                </div>
                <Field id="line" label="Address" value={address.line} onChange={(v) => setAddress({ ...address, line: v })} />
                <div className="grid grid-cols-3 gap-3">
                  <Field id="city" label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
                  <Field id="state" label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
                  <Field id="pin" label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button size="lg" disabled={!addressValid} onClick={() => setStep(2)}>Continue to review</Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="font-semibold mb-4">Review your order</h2>
              <div className="rounded-lg border">
                {lines.map((l) => {
                  const p = productMap.get(l.productId);
                  if (!p) return null;
                  return (
                    <div key={`${l.productId}-${l.size}`} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                      <img src={p.images[0]} alt="" className="h-16 w-14 rounded object-cover" />
                      <div className="flex-1 min-w-0 text-sm">
                        <div className="font-medium line-clamp-1">{p.title}</div>
                        <div className="text-xs text-muted-foreground">{l.size && `Size ${l.size} · `}Qty {l.qty}</div>
                      </div>
                      <div className="text-sm font-medium">{inr(p.price * l.qty)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 rounded-lg border p-4 text-sm">
                <div className="font-medium">Delivering to</div>
                <div className="text-muted-foreground mt-1">{address.name}, {address.line}, {address.city}, {address.state} {address.pincode}</div>
                <div className="text-muted-foreground">{address.phone}</div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" onClick={() => setStep(3)}>Continue to payment</Button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="font-semibold mb-4">Payment</h2>
              <RadioGroup value={payment} onValueChange={(v) => setPayment(v as "card" | "upi" | "cod")} className="space-y-3">
                {[
                  { id: "card", label: "Credit / Debit card", hint: "Visa, Mastercard, Amex, Rupay" },
                  { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm, BHIM" },
                  { id: "cod", label: "Cash on delivery", hint: "Pay when you receive" },
                ].map((opt) => (
                  <label key={opt.id} className={cn(
                    "flex gap-3 rounded-lg border p-4 cursor-pointer transition",
                    payment === opt.id ? "border-foreground bg-muted/30" : "hover:bg-muted/30",
                  )}>
                    <RadioGroupItem value={opt.id} className="mt-1" />
                    <div className="text-sm">
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-muted-foreground text-xs">{opt.hint}</div>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Payment integration coming soon — orders are created with status "pending".
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button size="lg" onClick={placeOrder} disabled={placing}>
                  {placing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Placing…</> : `Place order · ${inr(total)}`}
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 h-max rounded-lg border p-6">
          <div className="font-semibold">Order summary</div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="text-[color:var(--sale)]">−{inr(discount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd>{delivery === 0 ? "Free" : inr(delivery)}</dd></div>
          </dl>
          <div className="mt-4 border-t pt-4 flex justify-between font-semibold">
            <span>Total</span><span>{inr(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ id, label, placeholder, value, onChange }: { id: string; label: string; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input id={id} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
