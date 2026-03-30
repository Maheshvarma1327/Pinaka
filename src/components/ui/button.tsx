import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)] disabled:border-none disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-[#FFFFFF] hover:bg-[var(--primary-hover)]",
        destructive: "bg-[var(--error)] text-[#FFFFFF] hover:opacity-90",
        outline: "border border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary-light-bg)]",
        secondary: "bg-[var(--primary-light-bg)] text-[var(--primary)] hover:opacity-80",
        ghost: "hover:bg-[var(--primary-light-bg)] hover:text-[var(--primary)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
        success: "bg-[var(--success)] text-[#FFFFFF] hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3",
        lg: "h-11 rounded-sm px-8",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
