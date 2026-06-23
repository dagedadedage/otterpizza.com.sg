"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-normal transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer font-[family-name:var(--font-chelsea-market)]",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-dark hover:bg-white hover:text-primary shadow-sm",
        secondary:
          "bg-primary text-white hover:bg-primary-hover shadow-sm",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary-light",
        ghost:
          "text-primary bg-transparent hover:bg-primary-light",
      },
      size: {
        sm: "h-7 px-3 text-xs [&_svg]:size-3",
        md: "h-8 px-4 text-sm [&_svg]:size-3.5",
        lg: "h-9 px-5 text-[15px] [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
