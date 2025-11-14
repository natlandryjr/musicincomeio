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
    sm: { icon: "h-6 w-6", text: "text-sm" },
    md: { icon: "h-8 w-8", text: "text-base" },
    lg: { icon: "h-12 w-12", text: "text-xl" },
  };

  const currentSize = sizeClasses[size];

  if (variant === "icon") {
    return <LogoIcon className={cn(currentSize.icon, className)} />;
  }

  if (variant === "text") {
    return <StyledLogoText size={size} className={cn(className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoIcon className={currentSize.icon} />
      <StyledLogoText size={size} />
    </div>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left half of M - Blue equalizer bars */}
      <rect x="6" y="32" width="6" height="12" rx="3" fill="#3B82F6" />
      <rect x="12" y="28" width="6" height="16" rx="3" fill="#3B82F6" />
      <rect x="18" y="20" width="6" height="24" rx="3" fill="#3B82F6" />
      
      {/* Right half of M - Green equalizer bars */}
      <rect x="24" y="20" width="6" height="24" rx="3" fill="#10B981" />
      <rect x="30" y="28" width="6" height="16" rx="3" fill="#10B981" />
      <rect x="36" y="32" width="6" height="12" rx="3" fill="#10B981" />
    </svg>
  );
}


