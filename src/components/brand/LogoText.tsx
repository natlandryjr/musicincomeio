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
    lg: "text-2xl",
  };

  const circleSizes = {
    sm: { i: "h-1.5 w-1.5", o: "h-2 w-2" },
    md: { i: "h-2 w-2", o: "h-2.5 w-2.5" },
    lg: { i: "h-3 w-3", o: "h-3.5 w-3.5" },
  };

  const circles = circleSizes[size];

  return (
    <span className={cn("font-semibold tracking-tight text-foreground whitespace-nowrap", sizeClasses[size], className)}>
      MusicIncome
      <span className="relative inline-block ml-0.5 align-middle">
        {/* Dot */}
        <span className="text-orange-500 dark:text-orange-400 align-middle">.</span>
        {/* 'i' with circle */}
        <span className="relative inline-block align-middle ml-0.5">
          <span className={cn("absolute left-[0.12em] top-[0.2em] rounded-full border-2 border-orange-500 dark:border-orange-400", circles.i)} />
          <span className="text-orange-500 dark:text-orange-400 ml-[0.18em] align-middle">i</span>
        </span>
        {/* 'o' with circle */}
        <span className="relative inline-block align-middle ml-0.5">
          <span className={cn("absolute left-0 top-[0.15em] rounded-full border-2 border-orange-500 dark:border-orange-400", circles.o)} />
          <span className="text-orange-500 dark:text-orange-400 ml-[0.22em] align-middle">o</span>
        </span>
      </span>
    </span>
  );
}

