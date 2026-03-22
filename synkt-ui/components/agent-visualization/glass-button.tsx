"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg"
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton({ className, variant = "secondary", size = "md", children, disabled, ...props }, ref) {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
          "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.96]",
          // Variants
          variant === "primary" && [
            "bg-gradient-to-br from-accent-blue to-accent-purple",
            "text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]",
            "hover:brightness-110 hover:scale-[1.02]",
          ],
          variant === "secondary" && [
            "bg-[rgba(20,20,20,0.7)] backdrop-blur-[20px]",
            "border border-white/10 text-white",
            "hover:brightness-125 hover:border-white/20",
          ],
          // Sizes
          size === "sm" && "h-8 px-3 text-[13px]",
          size === "md" && "h-10 px-5 text-[13px]",
          size === "lg" && "h-12 px-6 text-[15px]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
