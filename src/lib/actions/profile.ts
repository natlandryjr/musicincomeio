"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingSchema, type OnboardingInput } from "@/lib/validators/auth";
import { ROUTES } from "@/lib/constants";
import { sendWelcomeEmail } from "@/lib/email/send";

/**
 * Server action result type
 */
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Complete user onboarding
 * Creates user profile and initializes royalty sources
 */
export async function completeOnboarding(
  input: OnboardingInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = onboardingSchema.parse(input);

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from("users")
      .update({
        artist_name: validated.artist_name,
        real_name: validated.real_name,
        distributor: validated.distributor,
        monthly_streams: validated.monthly_streams,
        writes_own_songs: validated.writes_own_songs,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return { success: false, error: "Failed to update profile" };
    }

    // Initialize royalty sources based on user input
    const royaltySources = [
      { source_type: "streaming", status: "collecting" }, // Always collecting if they have a distributor
    ];

    // If they write their own songs, they should collect from PRO and MLC
    if (validated.writes_own_songs) {
      royaltySources.push(
        { source_type: "pro", status: "unknown" },
        { source_type: "mlc", status: "unknown" }
      );
    }

    // If they have significant streams, they should collect from SoundExchange
    if (validated.monthly_streams >= 10000) {
      royaltySources.push({ source_type: "soundexchange", status: "unknown" });
    }

    // Insert royalty sources
    const { error: sourcesError } = await supabase
      .from("royalty_sources")
      .insert(
        royaltySources.map((source) => ({
          user_id: user.id,
          ...source,
        }))
      );

    if (sourcesError) {
      console.error("Error creating royalty sources:", sourcesError);
      // Don't fail onboarding if sources fail
    }

    // Send welcome email (don't await - send in background)
    sendWelcomeEmail(user.email!, validated.artist_name).catch((error) => {
      console.error("Error sending welcome email:", error);
      // Don't fail onboarding if email fails
    });

    // Revalidate and redirect
    revalidatePath(ROUTES.DASHBOARD);
    redirect(ROUTES.DASHBOARD);
  } catch (error) {
    console.error("Error in completeOnboarding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  input: Partial<OnboardingInput>
): Promise<ActionResult> {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update user profile
    const { error } = await supabase
      .from("users")
      .update(input)
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }

    // Revalidate relevant pages
    revalidatePath(ROUTES.SETTINGS);
    revalidatePath(ROUTES.DASHBOARD);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
