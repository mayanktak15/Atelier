import { createFileRoute, Outlet, Navigate, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading, profile, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return <div className="container-x py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleSignOut() {
    await signOut();
    nav({ to: "/admin/login", replace: true });
  }

  const navLinks = [
    { to: "/admin", label: "Dashboard", match: (p: string) => p === "/admin" || p === "/admin/" },
    { to: "/admin/products", label: "Products", match: (p: string) => p.startsWith("/admin/products") },
    { to: "/admin/orders", label: "Orders", match: (p: string) => p.startsWith("/admin/orders") },
  ] as const;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="container-x flex h-14 items-center gap-6">
          <Link to="/admin" className="font-display text-lg font-semibold">
            Atelier <span className="text-accent">Admin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-1.5 rounded-md hover:bg-muted transition-colors",
                  l.match(pathname) && "bg-muted font-medium text-foreground",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{profile?.email ?? user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sign out</Button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
