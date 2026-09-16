import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]",
        className,
      )}
      {...props}
    />
  );
}
