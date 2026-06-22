import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--gold)]/35 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-navy text-white hover:bg-navy-700 shadow-soft",
        gold: "bg-gold-gradient text-navy-900 hover:brightness-105 shadow-gold",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-border bg-card hover:bg-secondary text-foreground shadow-soft",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "hover:bg-secondary text-foreground",
        link: "text-navy underline-offset-4 hover:underline dark:text-gold",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3.5",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-[13px]",
        lg: "h-11 rounded-xl px-6",
        icon: "size-10",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
