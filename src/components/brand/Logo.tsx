import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type LogoProps = {
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * MusicIncome.io Logo Component
 * Uses the metallic silver script logo PNG image
 */
export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: { height: 24, width: 120 },
    md: { height: 32, width: 160 },
    lg: { height: 48, width: 240 },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="MusicIncome.io"
        width={currentSize.width}
        height={currentSize.height}
        className="h-auto w-auto object-contain"
        priority={size === "lg"}
      />
    </div>
  );
}


