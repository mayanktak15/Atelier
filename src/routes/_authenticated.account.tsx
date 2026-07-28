import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, MapPin, Heart, User, LogOut } from "lucide-react";
import { MOCK_ADDRESSES, PRODUCTS } from "@/lib/mock-data";
import { useAuth } from "@/store/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ProductGrid } from "@/components/ProductCard";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — Atelier" },
      { name: "description", content: "Manage your profile, addresses and wishlist." },
      { property: "og:title", content: "My account — Atelier" },
      { property: "og:description", content: "Manage your profile, addresses and wishlist." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

type Tab = "profile" | "orders" | "addresses" | "wishlist";

function Account() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const wishlist = PRODUCTS.slice(2, 6);
  const firstName = (profile?.name || user?.email || "there").split(" ")[0].split("@")[0];

  async function handleSignOut() {
    await signOut();
    nav({ to: "/", replace: true });
  }

  return (
    <div className="container-x py-8">
      <h1 className="font-display text-3xl md:text-4xl font-semibold">Hello, {firstName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account and orders.</p>

      <div className="mt-8 grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="space-y-1">
          <NavBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={<User className="h-4 w-4" />}>Profile</NavBtn>
          <Link to="/orders" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
            <Package className="h-4 w-4" /> Orders
          </Link>
          <NavBtn active={tab === "addresses"} onClick={() => setTab("addresses")} icon={<MapPin className="h-4 w-4" />}>Addresses</NavBtn>
          <NavBtn active={tab === "wishlist"} onClick={() => setTab("wishlist")} icon={<Heart className="h-4 w-4" />}>Wishlist</NavBtn>
          <button onClick={handleSignOut} className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground w-full">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <div>
          {tab === "profile" && <ProfileTab onSaved={refreshProfile} />}
          {tab === "addresses" && <AddressesTab />}
          {tab === "wishlist" && (
            <div>
              <h2 className="font-display text-2xl font-semibold mb-6">Wishlist</h2>
              <ProductGrid products={wishlist} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition text-left",
        active ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      )}
    >
      {icon} {children}
    </button>
  );
}

function ProfileTab({ onSaved }: { onSaved: () => Promise<void> }) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    email: profile?.email ?? user?.email ?? "",
    phone: profile?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: profile?.name ?? "",
      email: profile?.email ?? user?.email ?? "",
      phone: profile?.phone ?? "",
    });
  }, [profile, user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: form.name, phone: form.phone })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await onSaved();
    toast.success("Profile saved");
  }

  async function handleReset() {
    if (!form.email) { toast.error("Missing email"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Reset link sent to your email");
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-2xl font-semibold mb-6">Profile</h2>
      <div className="space-y-4">
        <Field id="name" label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field id="email" label="Email" type="email" value={form.email} onChange={() => { /* email change requires re-auth; disabled */ }} disabled />
        <Field id="phone" label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </div>

      <div className="mt-10 border-t pt-6">
        <h3 className="font-medium">Password</h3>
        <p className="text-sm text-muted-foreground mt-1">Send a password reset link to your email.</p>
        <Button variant="outline" className="mt-3" onClick={handleReset}>Send reset link</Button>
      </div>
    </div>
  );
}

function AddressesTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold">Saved addresses</h2>
        <Button onClick={() => toast.info("New address form (demo)")}>+ Add address</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_ADDRESSES.map((a) => (
          <div key={a.id} className="rounded-lg border p-5 text-sm">
            <div className="flex items-start justify-between">
              <div className="font-medium">{a.name}</div>
              {a.isDefault && <span className="text-[10px] uppercase tracking-widest text-accent">Default</span>}
            </div>
            <div className="text-muted-foreground mt-1">{a.line}</div>
            <div className="text-muted-foreground">{a.city}, {a.state} {a.pincode}</div>
            <div className="text-muted-foreground">{a.phone}</div>
            <div className="mt-3 flex gap-2 text-xs">
              <button className="underline text-muted-foreground hover:text-foreground">Edit</button>
              <button className="underline text-muted-foreground hover:text-destructive">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, type = "text", disabled }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input id={id} type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
