import { z } from "zod";

/**
 * Sign up form validation
 */
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

/**
 * Sign in form validation
 */
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Password reset request
 */
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * New password after reset
 */
export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Onboarding profile schema
 */
export const onboardingSchema = z.object({
  artist_name: z.string().min(1, "Artist name is required").max(100),
  real_name: z.string().min(1, "Real name is required").max(100),
  distributor: z.enum(["distrokid", "tunecore", "cdbaby", "other"]),
  monthly_streams: z.number().int().nonnegative(),
  writes_own_songs: z.boolean(),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
