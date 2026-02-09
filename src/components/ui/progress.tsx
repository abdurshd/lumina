"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-overlay-light relative h-4 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <motion.div
        data-slot="progress-indicator"
        className="bg-primary h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value || 0}%` }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 200, damping: 25 }
        }
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
