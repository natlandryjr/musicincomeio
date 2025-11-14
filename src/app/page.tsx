"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, Waves } from "lucide-react";

import { Logo } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  "Track every source in one ledger",
  "Find unclaimed royalties instantly",
  "Get paid faster with smart alerts",
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/35 via-transparent to-transparent" />
        <div className="dot-grid absolute inset-0 opacity-20" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-20 sm:px-10 lg:px-16">
        {/* Logo at top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-16 flex justify-center sm:justify-start"
        >
          <Logo size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <Badge variant="accent" className="mb-4 inline-flex items-center gap-2 bg-accent/20 px-4 text-sm text-accent">
            <Sparkles className="h-4 w-4" /> Built for indie artists & teams
          </Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Capture <span className="text-secondary">every royalty</span>, from stream to payout.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            MusicIncome.io centralizes distributor statements, PRO data, SoundExchange, and more.
            Stop guessing—it’s time to know exactly what you’re owed.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "relative overflow-hidden"
              )}
            >
              <span className="absolute inset-0 animate-[pulse_2.4s_ease-in-out_infinite] bg-gradient-to-r from-secondary/40 via-transparent to-secondary/40" />
              <span className="relative flex items-center gap-2">
                Get started free
                <Waves className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "border border-border/70"
              )}
            >
              Sign in
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 text-sm text-muted sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 rounded-2xl border border-border/40 bg-panel/60 px-4 py-3 backdrop-blur">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6, ease: "anticipate" }}
          className="mt-16 grid gap-4 text-xs text-muted sm:grid-cols-2 lg:grid-cols-4"
        >
          {["Built for indie artists", "Secure by Supabase", "Payments via Stripe", "Trusted by catalog admins"].map(
            (text) => (
              <div
                key={text}
                className="flex items-center gap-2 rounded-2xl border border-border/40 bg-panel/50 px-4 py-3 shadow-brand"
              >
                <ShieldIcon className="h-4 w-4 text-secondary" />
                <span>{text}</span>
              </div>
            )
          )}
        </motion.div>
      </div>
    </main>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3 5 6v5c0 5 3.8 9.4 7 10 3.2-.6 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
