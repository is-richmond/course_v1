import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg", className)}
      {...props}
    />
  )
}