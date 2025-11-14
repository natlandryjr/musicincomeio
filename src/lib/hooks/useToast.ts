"use client";

import { toast as sonnerToast } from "sonner";

/**
 * Custom toast hook with typed methods
 * Uses Sonner under the hood for beautiful toast notifications
 *
 * @example
 * ```tsx
 * import { useToast } from "@/lib/hooks/useToast";
 *
 * function MyComponent() {
 *   const { toast } = useToast();
 *
 *   return (
 *     <button onClick={() => toast.success("Saved!")}>
 *       Save
 *     </button>
 *   );
 * }
 * ```
 */
export function useToast() {
  return {
    toast: {
      success: (message: string, description?: string) => {
        sonnerToast.success(message, { description });
      },
      error: (message: string, description?: string) => {
        sonnerToast.error(message, { description });
      },
      info: (message: string, description?: string) => {
        sonnerToast.info(message, { description });
      },
      warning: (message: string, description?: string) => {
        sonnerToast.warning(message, { description });
      },
      loading: (message: string, description?: string) => {
        return sonnerToast.loading(message, { description });
      },
      promise: <T,>(
        promise: Promise<T>,
        {
          loading,
          success,
          error,
        }: {
          loading: string;
          success: string | ((data: T) => string);
          error: string | ((error: unknown) => string);
        }
      ) => {
        return sonnerToast.promise(promise, {
          loading,
          success,
          error,
        });
      },
      dismiss: (id?: string | number) => {
        sonnerToast.dismiss(id);
      },
    },
  };
}

// Export the raw toast for one-off usage without hook
export const toast = {
  success: sonnerToast.success,
  error: sonnerToast.error,
  info: sonnerToast.info,
  warning: sonnerToast.warning,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
};
