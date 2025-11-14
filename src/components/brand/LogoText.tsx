import React from "react";
import { cn } from "@/lib/utils";

type LogoTextProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

/**
 * Logo text component with styled ".io" suffix
 */
export function LogoText({ className, size = "md" }: LogoTextProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <span className={cn("font-semibold tracking-tight text-foreground", sizeClasses[size], className)}>
      MusicIncome
      <span className="relative inline-block ml-0.5">
        {/* Dot */}
        <span className="text-orange-500 dark:text-orange-400">.</span>
        {/* 'i' with circle */}
        <span className="relative inline-block">
          <span className="absolute left-[0.15em] top-[0.15em] h-2 w-2 rounded-full border-2 border-orange-500 dark:border-orange-400" />
          <span className="text-orange-500 dark:text-orange-400 ml-[0.2em]">i</span>
        </span>
        {/* 'o' with circle */}
        <span className="relative inline-block ml-0.5">
          <span className="absolute left-0 top-[0.1em] h-2.5 w-2.5 rounded-full border-2 border-orange-500 dark:border-orange-400" />
          <span className="text-orange-500 dark:text-orange-400 ml-[0.25em]">o</span>
        </span>
      </span>
    </span>
  );
}

