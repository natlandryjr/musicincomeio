"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function SignOutButton() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out. See you soon!");
    router.refresh();
    router.push("/sign-in");
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} className="border border-border/60">
      Sign out
    </Button>
  );
}


