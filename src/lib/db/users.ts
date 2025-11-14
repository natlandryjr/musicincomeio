import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * User profile type from database
 */
export type UserProfile = {
  id: string;
  email: string;
  artist_name: string | null;
  real_name: string | null;
  distributor: string | null;
  writes_own_songs: boolean;
  monthly_streams: number;
  subscription_tier: "free" | "pro";
  stripe_customer_id: string | null;
  created_at: string;
};

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }

  return data as UserProfile;
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return getUserProfile(user.id);
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string) {
  const profile = await getUserProfile(userId);
  return Boolean(profile.artist_name && profile.real_name);
}

/**
 * Get user's subscription tier
 */
export async function getUserSubscriptionTier(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching subscription tier:", error);
    return "free";
  }

  return data.subscription_tier || "free";
}
