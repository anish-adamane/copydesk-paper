import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]",
  {
    variants: {
      variant: {
        paper:
          "border border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--manila)]",
        ink: "border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] hover:bg-[#2c261f]",
        keep: "border-2 border-[var(--stamp-keep)] text-[var(--stamp-keep)] bg-transparent hover:bg-[#21563a]/10",
        kill: "border-2 border-[var(--stamp-kill)] text-[var(--stamp-kill)] bg-transparent hover:bg-[#9c1f16]/10",
        approve:
          "border-2 border-[var(--stamp-kill)] bg-[var(--stamp-kill)] text-[var(--paper)] hover:bg-[#7a1812]",
        telex:
          "border border-dashed border-[var(--ink)] bg-[var(--carbon)] text-[var(--paper)] hover:bg-[#1a1714]",
        ghost: "border border-transparent text-[var(--ink-muted)] hover:border-[var(--rule)]",
      },
      size: {
        sm: "h-7 px-2",
        md: "h-8 px-3",
        lg: "h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "paper",
      size: "md",
    },
  },
);

export function Button({
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

export { buttonVariants };
