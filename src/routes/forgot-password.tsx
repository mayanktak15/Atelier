import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Atelier" },
      { name: "description", content: "Reset your Atelier account password by email." },
      { property: "og:title", content: "Reset your password — Atelier" },
      { property: "og:description", content: "We'll email you a reset link." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) { toast.error("Enter a valid email"); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Reset link sent");
  }

  return (
    <div className="container-x py-16 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="font-display text-4xl font-semibold text-center">Forgot password</h1>
        {sent ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            If an account exists for <strong>{email}</strong>, we've sent a reset link.
            Check your inbox and follow the instructions.
          </p>
        ) : (
          <>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              We'll send a password reset link to your email.
            </p>
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
