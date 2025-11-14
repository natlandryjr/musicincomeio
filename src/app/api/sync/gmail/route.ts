import { NextResponse } from "next/server";

import { syncGmailForUser } from "@/lib/gmailSync";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imported = await syncGmailForUser(user.id);

    return NextResponse.json({ imported });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gmail sync failed";
    console.error("Gmail sync error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


