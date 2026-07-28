import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Atelier" },
      { name: "description", content: "Create an Atelier account to track orders, save wishlists and check out faster." },
      { property: "og:title", content: "Create your account — Atelier" },
      { property: "og:description", content: "Join Atelier — considered fashion, made to last." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, user, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/account", replace: true });
  }, [user, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(form.email, form.password, form.name);
    setSubmitting(false);
    if (error) { toast.error(error); return; }
    toast.success("Account created");
    nav({ to: "/account", replace: true });
  }

  return (
    <div className="container-x py-16 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="font-display text-4xl font-semibold text-center">Create your account</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Join Atelier — track orders and build your wardrobe.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Full name" id="name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
          <Field label="Email" id="email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" />
          <Field label="Password" id="password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} autoComplete="new-password" />
          <Field label="Confirm password" id="confirm" type="password" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} autoComplete="new-password" />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, type = "text", autoComplete }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}
