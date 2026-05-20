import { cn } from "@/lib/utils"

interface AvatarCircleProps {
  initials: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl"
}

export function AvatarCircle({ initials, size = "md", className }: AvatarCircleProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/20 text-primary font-semibold",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
