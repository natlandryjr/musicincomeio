"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

// Prevent static generation - requires runtime env vars
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "We couldn't create your account.");
      return;
    }

    toast.success("Check your inbox to confirm your account.");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <Logo size="md" />
      </div>
      <Card className="relative w-full max-w-md border border-border/60 bg-panel/90">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-semibold">Create your account</CardTitle>
          <p className="text-sm text-muted">
            Your command center for distributor, PRO, and SoundExchange revenue.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
            />
            <Button type="submit" loading={loading} className="w-full">
              Sign Up
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted">
            Already have an account?{" "}
            <Link className="text-secondary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}


