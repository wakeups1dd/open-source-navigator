import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono font-bold uppercase tracking-wide transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1 active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1 active:shadow-none",
        outline:
          "bg-background text-foreground border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1 active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1 active:shadow-none",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent:
          "bg-accent text-accent-foreground border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1 active:shadow-none",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
