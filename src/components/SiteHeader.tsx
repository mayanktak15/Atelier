import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, User, Menu, X, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { CATEGORIES } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-db";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { count } = useCart();
  const { user, profile, signOut } = useAuth();
  const { data: products } = useProducts();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();

  const results = q.trim().length > 1
    ? (products ?? []).filter((p) =>
        (p.title + " " + p.brand + " " + p.subcategory).toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container-x flex h-14 items-center gap-4">
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="font-display text-xl font-semibold tracking-tight">
          Atelier<span className="text-accent">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 pl-6 text-sm">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/shop/$category"
              params={{ category: c.slug }}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <div className="relative ml-auto hidden md:block w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setTimeout(() => setFocus(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim()) {
                nav({ to: "/shop", search: { q: q.trim() } as any });
              }
            }}
            placeholder="Search for linen, jeans, sarees…"
            className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-background"
          />
          {focus && results.length > 0 && (
            <div className="absolute left-0 right-0 top-11 rounded-md border border-border bg-popover shadow-lg">
              {results.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setQ("")}
                >
                  <img src={p.images[0]} alt="" className="h-10 w-8 rounded object-cover" />
                  <div>
                    <div className="line-clamp-1">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.brand}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto md:ml-0 flex items-center gap-1">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                onBlur={() => setTimeout(() => setMenu(false), 150)}
                className="hidden md:flex items-center gap-2 rounded-full px-3 h-9 text-sm hover:bg-muted"
                aria-label="Account menu"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[10ch] truncate">{(profile?.name || user.email || "").split(" ")[0] || "Account"}</span>
              </button>
              <Link to="/account" className="md:hidden grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Account">
                <User className="h-4 w-4" />
              </Link>
              {menu && (
                <div className="absolute right-0 top-11 w-48 rounded-md border border-border bg-popover shadow-lg text-sm py-1">
                  <Link to="/account" className="block px-3 py-2 hover:bg-muted">My account</Link>
                  <Link to="/orders" className="block px-3 py-2 hover:bg-muted">Orders</Link>
                  <button
                    onClick={async () => { await signOut(); nav({ to: "/" }); }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex items-center gap-1.5 rounded-full px-3 h-9 text-sm hover:bg-muted">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
          <Link to={user ? "/account" : "/login"} className="md:hidden grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Account">
            <User className="h-4 w-4" />
          </Link>
          <Link to="/account" className="hidden md:grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Wishlist">
            <Heart className="h-4 w-4" />
          </Link>
          <Link to="/cart" className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className={cn("md:hidden border-t border-border overflow-hidden transition-[max-height]", open ? "max-h-96" : "max-h-0")}>
        <div className="container-x py-3 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="pl-9 h-9"
            />
          </div>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/shop/$category"
              params={{ category: c.slug }}
              className="py-1 text-sm"
              onClick={() => setOpen(false)}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
