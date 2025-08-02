"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tacticalButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium tracking-wider text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/25",
        secondary: "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 hover:border-neutral-600",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/25",
        ghost: "hover:bg-neutral-800 text-neutral-300 hover:text-white",
        outline: "border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px]",
        sm: "h-9 rounded-md px-3 min-h-[36px]",
        lg: "h-11 rounded-md px-8 min-h-[44px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface TacticalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tacticalButtonVariants> {
  asChild?: boolean
  tactical?: boolean
}

const TacticalButton = React.forwardRef<HTMLButtonElement, TacticalButtonProps>(
  ({ className, variant, size, asChild = false, tactical = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const processedChildren = tactical && typeof children === 'string' 
      ? children.toUpperCase() 
      : children

    return (
      <Comp
        className={cn(tacticalButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {processedChildren}
      </Comp>
    )
  }
)
TacticalButton.displayName = "TacticalButton"

export { TacticalButton, tacticalButtonVariants }