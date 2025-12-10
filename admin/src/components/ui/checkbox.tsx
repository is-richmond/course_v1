"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-primary/90 data-[state=checked]:text-white data-[state=checked]:border-primary focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-2 aria-invalid:ring-destructive/30 aria-invalid:border-destructive size-5 shrink-0 rounded-md border-2 shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary/50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-4 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }