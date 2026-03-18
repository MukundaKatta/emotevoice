import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "emotion" | "outline";
  color?: string;
}

export function Badge({
  className,
  variant = "default",
  color,
  style,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-surface-800 text-surface-200 border-surface-600",
    emotion: "border-current",
    outline: "bg-transparent border-surface-500 text-surface-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        variants[variant],
        className
      )}
      style={
        color
          ? {
              color,
              backgroundColor: `${color}15`,
              borderColor: `${color}40`,
              ...style,
            }
          : style
      }
      {...props}
    />
  );
}
