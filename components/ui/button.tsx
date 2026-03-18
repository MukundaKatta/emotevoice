import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary:
        "bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/25",
      secondary:
        "bg-surface-800 hover:bg-surface-700 text-white border border-surface-600",
      ghost: "hover:bg-white/10 text-surface-300 hover:text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25",
      outline:
        "border border-brand-500/50 text-brand-400 hover:bg-brand-500/10",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-4 py-2 text-sm rounded-lg",
      lg: "px-6 py-3 text-base rounded-xl",
      icon: "p-2 rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
