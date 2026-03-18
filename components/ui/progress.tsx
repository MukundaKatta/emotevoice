import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Progress({
  value,
  max = 100,
  className,
  color,
  showLabel = false,
  size = "md",
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const sizes = { sm: "h-1", md: "h-2", lg: "h-3" };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs text-surface-400">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-surface-800 rounded-full overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color || "rgb(92, 124, 250)",
          }}
        />
      </div>
    </div>
  );
}
