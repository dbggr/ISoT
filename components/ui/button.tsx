import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 high-contrast:border-2 high-contrast:border-solid forced-colors:border-[ButtonText] motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 high-contrast:bg-[ButtonFace] high-contrast:text-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 high-contrast:bg-[ButtonFace] high-contrast:text-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground high-contrast:border-2 high-contrast:border-[ButtonText] forced-colors:border-[ButtonText]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 high-contrast:bg-[ButtonFace] high-contrast:text-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]",
        ghost: "hover:bg-accent hover:text-accent-foreground high-contrast:hover:bg-[Highlight] high-contrast:hover:text-[HighlightText] forced-colors:hover:bg-[Highlight] forced-colors:hover:text-[HighlightText]",
        link: "text-primary underline-offset-4 hover:underline high-contrast:text-[LinkText] forced-colors:text-[LinkText]",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px]",
        sm: "h-9 rounded-md px-3 min-h-[36px]",
        lg: "h-11 rounded-md px-8 min-h-[44px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }