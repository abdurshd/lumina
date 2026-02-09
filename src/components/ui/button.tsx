import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold tracking-wide uppercase transition-all select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-[0_4px_0_var(--primary-dark)] hover:brightness-110 active:shadow-none active:translate-y-1 disabled:bg-[#37464f] disabled:text-[#52656d] disabled:shadow-none disabled:translate-y-1 disabled:brightness-100",
        destructive:
          "bg-destructive text-white shadow-[0_4px_0_var(--destructive-dark)] hover:brightness-110 active:shadow-none active:translate-y-1 disabled:bg-[#37464f] disabled:text-[#52656d] disabled:shadow-none disabled:translate-y-1",
        outline:
          "bg-card text-foreground border-2 border-white/12 shadow-[0_3px_0_rgba(255,255,255,0.06)] hover:bg-white/[0.04] hover:border-white/18 active:shadow-none active:translate-y-[3px]",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-white/8 shadow-[0_2px_0_rgba(255,255,255,0.04)] hover:bg-secondary/80 active:shadow-none active:translate-y-[2px]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground rounded-xl shadow-none uppercase-none tracking-normal font-medium",
        link: "text-primary underline-offset-4 hover:underline shadow-none uppercase-none tracking-normal font-medium",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-xl px-2.5 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-xl gap-1.5 px-3.5 has-[>svg]:px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
