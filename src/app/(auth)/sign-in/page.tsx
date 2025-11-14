"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

// Prevent static generation - requires runtime env vars
export const dynamic = "force-dynamic";

export default function SignInPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message ?? "Unable to sign you in.");
      setLoading(false);
      return;
    }

    router.refresh();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Signed in, but we couldn't load the session. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    toast.success("Welcome back! Redirecting you now.");
    router.push(profile?.id ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
      <div className="absolute top-8 z-10">
        <Logo size="md" />
      </div>
      <Card className="relative w-full max-w-md border border-border/60 bg-panel/90">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-semibold">Welcome back</CardTitle>
          <p className="text-sm text-muted">Track, detect, and capture every music royalty.</p>
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
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted">
            Need an account?{" "}
            <Link className="text-secondary underline" href="/sign-up">
              Create one free
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}


