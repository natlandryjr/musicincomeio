import React from "react";
import { cn } from "@/lib/utils";
import { LogoText as StyledLogoText } from "./LogoText";

export type LogoProps = {
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * MusicIncome.io Logo Component
 * Features:
 * - Blue/green "M" logo with equalizer-style bars
 * - "MusicIncome.io" text with special ".io" styling
 */
export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: { icon: "h-7 w-7", text: "text-sm", gap: "gap-2" },
    md: { icon: "h-9 w-9", text: "text-base", gap: "gap-2.5" },
    lg: { icon: "h-12 w-12", text: "text-xl", gap: "gap-3" },
  };

  const currentSize = sizeClasses[size];

  if (variant === "icon") {
    return <LogoIcon className={cn(currentSize.icon, "flex-shrink-0", className)} />;
  }

  if (variant === "text") {
    return <StyledLogoText size={size} className={cn(className)} />;
  }

  return (
    <div className={cn("flex items-center", currentSize.gap, className)}>
      <LogoIcon className={cn(currentSize.icon, "flex-shrink-0")} />
      <StyledLogoText size={size} className="flex-shrink-0" />
    </div>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("aspect-square", className)}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Left half of M - Blue equalizer bars (increasing height) */}
      <rect x="4" y="36" width="5" height="8" rx="2.5" fill="#3B82F6" />
      <rect x="10" y="30" width="5" height="14" rx="2.5" fill="#3B82F6" />
      <rect x="16" y="18" width="5" height="26" rx="2.5" fill="#3B82F6" />
      
      {/* Right half of M - Green equalizer bars (decreasing height) */}
      <rect x="27" y="18" width="5" height="26" rx="2.5" fill="#10B981" />
      <rect x="33" y="30" width="5" height="14" rx="2.5" fill="#10B981" />
      <rect x="39" y="36" width="5" height="8" rx="2.5" fill="#10B981" />
    </svg>
  );
}


