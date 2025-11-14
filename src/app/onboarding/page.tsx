"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const DISTRIBUTORS = [
  { value: "distrokid", label: "DistroKid" },
  { value: "tunecore", label: "TuneCore" },
  { value: "cdbaby", label: "CD Baby" },
  { value: "other", label: "Other" },
] as const;

type DistributorValue = (typeof DISTRIBUTORS)[number]["value"];

export default function OnboardingPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [artistName, setArtistName] = useState("");
  const [realName, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [distributor, setDistributor] = useState<DistributorValue>("distrokid");
  const [writesOwnSongs, setWritesOwnSongs] = useState(false);
  const [monthlyStreams, setMonthlyStreams] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile, error } = await supabase
        .from("users")
        .select("id, artist_name, real_name, distributor, writes_own_songs, monthly_streams")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        toast.error("Unable to load your profile right now.");
      }

      if (profile?.id) {
        router.push("/dashboard");
        return;
      }

      if (!active) return;
      setLoading(false);
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedArtist = artistName.trim();
    const trimmedReal = realName.trim();
    const trimmedEmail = email.trim();
    const streamValue = Number(monthlyStreams.replace(/,/g, ""));

    if (!trimmedArtist) {
      setErrorMsg("Please enter your artist or stage name.");
      return;
    }
    if (!trimmedReal) {
      setErrorMsg("Please enter your real name.");
      return;
    }
    if (!trimmedEmail) {
      setErrorMsg("Email is required.");
      return;
    }
    if (Number.isNaN(streamValue) || streamValue < 0) {
      setErrorMsg("Monthly streams must be zero or greater.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { error } = await supabase.from("users").upsert({
        id: user.id,
        email: trimmedEmail,
        artist_name: trimmedArtist,
        real_name: trimmedReal,
        distributor,
        writes_own_songs: writesOwnSongs,
        monthly_streams: Number.isFinite(streamValue) ? streamValue : 0,
      });

      if (error) throw error;

      const SOURCE_TYPES = [
        "streaming",
        "soundexchange",
        "pro",
        "mlc",
        "youtube",
        "neighbouring",
        "sync",
      ] as const;

      await Promise.all(
        SOURCE_TYPES.map((source) =>
          supabase.from("royalty_sources").upsert({ user_id: user.id, source_type: source, status: "unknown" })
        )
      );

      toast.success("Profile saved. Your dashboard is ready!");
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong saving your profile.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <Card className="w-full max-w-xl animate-pulse bg-panel/70">
          <CardContent className="space-y-6 py-12">
            <div className="h-6 w-32 rounded-full bg-border/40" />
            <div className="h-10 w-3/4 rounded-full bg-border/40" />
            <div className="h-32 rounded-2xl bg-border/30" />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-16 sm:px-6">
      <div className="absolute inset-x-0 top-0 h-64 rounded-b-[4rem] bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
      <Card className="relative w-full max-w-2xl border border-border/60 bg-panel/90">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <BadgeDots />
            <div className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary" aria-hidden="true" />
              Secure Supabase session
            </div>
          </div>
          <CardTitle className="text-3xl font-bold leading-tight">
            Tell us about your music
          </CardTitle>
          <p className="text-sm text-muted">
            These details tune your dashboard and Missing Money Detector. You can update them anytime.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Artist / Stage Name" hint="How listeners know you">
                <Input
                  placeholder="e.g., Pops Gambino"
                  value={artistName}
                  onChange={(event) => setArtistName(event.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label="Legal Name" hint="We’ll keep it private">
                <Input
                  placeholder="e.g., Nathaniel Landry"
                  value={realName}
                  onChange={(event) => setRealName(event.target.value)}
                  autoComplete="off"
                />
              </Field>
            </div>

            <Field label="Email" hint="For alerts and account notifications">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </Field>

            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Primary Distributor" hint="Where you upload releases">
                <Select
                  value={distributor}
                  onValueChange={(value: DistributorValue) => setDistributor(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose distributor" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRIBUTORS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label="Monthly Streams"
                hint="Helps us estimate unclaimed royalties"
                labelAdornment={
                  <Tooltip>
                    <TooltipTrigger className="text-muted">
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Streams power your Missing Money estimate—it never leaves your account.
                    </TooltipContent>
                  </Tooltip>
                }
              >
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={monthlyStreams}
                  onChange={(event) => setMonthlyStreams(event.target.value)}
                  placeholder="e.g., 10000"
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={writesOwnSongs}
                  onCheckedChange={(checked) => setWritesOwnSongs(Boolean(checked))}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium text-foreground">
                    I write or co-write my songs
                  </span>
                  <br />
                  <span className="text-xs text-muted">
                    We’ll guide you to PRO and MLC registrations so you don’t miss publishing royalties.
                  </span>
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4">
              <Button
                type="button"
                variant="ghost"
                className="sm:w-auto"
                onClick={() => router.push("/dashboard")}
              >
                Skip for now
              </Button>
              <Button type="submit" loading={saving} className="sm:w-auto">
                Save & Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function Field({
  label,
  hint,
  labelAdornment,
  children,
}: {
  label: string;
  hint?: string;
  labelAdornment?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-medium text-foreground">
        <span>{label}</span>
        {labelAdornment}
      </div>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

function BadgeDots() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span className="inline-flex h-6 items-center rounded-full border border-border/60 bg-background/60 px-3">
        Step 1 of 1
      </span>
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        <span className="h-2.5 w-2.5 rounded-full bg-border/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-border/60" />
      </span>
    </div>
  );
}
