"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  LayoutDashboard,
  Library,
  Menu,
  Moon,
  Music4,
  PieChart,
  ShieldCheck,
  Sun,
  Wallet2,
} from "lucide-react";

import SignOutButton from "@/components/SignOutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & gaps",
  },
  { href: "/income", label: "Income", icon: Wallet2, description: "Manual entries" },
  { href: "/library", label: "Library", icon: Library, description: "Guides & playbooks", badge: "New" },
  { href: "/billing", label: "Billing", icon: CreditCard, description: "Plan & invoices" },
  { href: "/connections", label: "Connections", icon: ShieldCheck, description: "Linked accounts" },
];

export type AppShellProps = {
  title?: string;
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    plan?: string | null;
  } | null;
};

export default function AppShell({ title, children, user }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  const displayName = React.useMemo(() => {
    if (!user) return null;
    return user.name ?? user.email?.split("@")[0] ?? null;
  }, [user]);

  const displayEmail = user?.email ?? null;
  const plan = user?.plan ?? null;
  const initials = React.useMemo(() => {
    const source = displayName ?? displayEmail;
    if (!source) return null;
    return source
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [displayName, displayEmail]);

  const pageKey = `${pathname}-${title ?? "page"}`;

  const themeToggleLabel = `Switch to ${theme === "light" ? "dark" : "light"} mode`;

  return (
    <TooltipProvider>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
          <div className="dot-grid absolute inset-0 opacity-[0.07]" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent" />
        </div>

        <div className="sticky top-0 z-40 lg:hidden">
          <div className="flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-lg">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex h-full w-80 flex-col gap-6 border-border/40">
                <SheetHeader className="gap-2">
                  <SheetTitle className="text-lg font-semibold">MusicIncome.io</SheetTitle>
                  <SheetDescription>Navigate your revenue tools.</SheetDescription>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto pr-2">
                  <NavList currentPath={pathname} onNavigate={() => setOpen(false)} />
                </nav>
                <UserPanel
                  userDetails={displayName || displayEmail ? { displayName, displayEmail, plan, initials } : null}
                />
              </SheetContent>
            </Sheet>
            <div className="flex flex-1 items-center justify-center">
              <BrandLockup />
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label={themeToggleLabel} onClick={toggleTheme}>
                    {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{themeToggleLabel}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Security">
                    <ShieldCheck className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Protected connections</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="hidden min-h-screen lg:grid lg:grid-cols-[275px_1fr]">
          <aside className="relative border-r border-border/40 bg-background/70 px-5 pb-10 pt-8 backdrop-blur">
            <div className="space-y-6">
              <BrandLockup />
              <nav>
                <NavList currentPath={pathname} />
              </nav>
              <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-xs text-primary">
                <div className="mb-1 font-semibold uppercase tracking-widest text-primary/80">Pro tip</div>
                Sync your distributor statements to catch gaps faster.
              </div>
            </div>
            <UserPanel
              userDetails={displayName || displayEmail ? { displayName, displayEmail, plan, initials } : null}
            />
          </aside>

          <div className="relative flex flex-col">
            <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur">
              <div className="flex flex-col gap-4 px-10 py-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">MusicIncome.io</p>
                  <h1 className="text-3xl font-bold leading-tight">
                    {title ?? "MusicIncome.io"}
                  </h1>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <Badge variant="outline" className="flex items-center gap-2 border-border/40">
                    <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
                    Real-time Supabase security
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label={themeToggleLabel} onClick={toggleTheme}>
                        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{themeToggleLabel}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="h-[2px] w-full bg-gradient-to-r from-primary/60 via-secondary/50 to-transparent" />
            </header>

            <AnimatePresence mode="wait">
              <motion.main
                key={pageKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex-1 px-4 py-8 sm:px-8 lg:px-12"
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            <motion.main
              key={pageKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="px-4 py-6"
            >
              {title && <h1 className="mb-4 text-3xl font-bold leading-tight">{title}</h1>}
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
}

type NavListProps = {
  currentPath: string;
  onNavigate?: () => void;
};

function NavList({ currentPath, onNavigate }: NavListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary/15 text-white shadow-lg shadow-primary/20"
                  : "text-muted hover:bg-panel/70 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-border/40 bg-panel/80 transition",
                  active ? "border-primary/50 bg-primary/25 text-primary" : "group-hover:border-border"
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="text-xs text-muted">{item.description}</span>
                </div>
                {item.badge && <Badge variant="accent">{item.badge}</Badge>}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function BrandLockup() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-r from-primary/30 via-transparent to-transparent px-4 py-3 text-sm text-foreground">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
        <Music4 className="h-5 w-5 animate-pulse" aria-hidden="true" />
        <PieChart className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full border border-primary/70 bg-secondary text-black shadow" aria-hidden="true" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">MusicIncome.io</span>
        <span className="text-base font-semibold">Every royalty, one home</span>
      </div>
    </div>
  );
}

function UserPanel({
  userDetails,
}: {
  userDetails: {
    displayName: string | null;
    displayEmail: string | null;
    plan: string | null;
    initials: string | null;
  } | null;
}) {
  if (!userDetails) return null;

  const { displayName, displayEmail, plan, initials } = userDetails;

  return (
    <Card className="mt-8 w-full rounded-2xl border border-border/40 bg-panel/80 p-4">
      <div className="flex items-center gap-3">
        {initials ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/25 text-lg font-semibold text-primary">
            {initials}
          </div>
        ) : null}
        <div className="flex-1 text-sm">
          {displayName && <div className="font-semibold leading-tight">{displayName}</div>}
          {displayEmail && <div className="text-xs text-muted">{displayEmail}</div>}
        </div>
        {plan && (
          <Badge variant={plan === "pro" ? "default" : "muted"} className="capitalize">
            {plan}
          </Badge>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden="true" />
          Secured by Supabase & Stripe
        </div>
        <SignOutButton />
      </div>
    </Card>
  );
}


