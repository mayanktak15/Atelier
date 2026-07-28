import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin sign in — Atelier" },
      { name: "description", content: "Atelier admin console access." },
      { property: "og:title", content: "Admin sign in — Atelier" },
      { property: "og:description", content: "Atelier admin console access." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setSubmitting(false);
      toast.error(error?.message ?? "Sign in failed");
      return;
    }

    // Verify admin role via has_role RPC (RLS on user_roles restricts to own row)
    const { data: roleRows, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");

    setSubmitting(false);

    if (rolesError || !roleRows || roleRows.length === 0) {
      await supabase.auth.signOut();
      toast.error("This account does not have admin access");
      return;
    }

    toast.success("Welcome, admin");
    nav({ to: "/admin", replace: true });
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-accent">Atelier</div>
          <h1 className="font-display text-3xl font-semibold mt-1">Admin console</h1>
          <p className="mt-2 text-sm text-muted-foreground">Restricted — staff sign in only.</p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Admin email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in to admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}
