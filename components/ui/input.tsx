import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full border border-[var(--ink)] bg-[var(--paper)] px-2 font-serif text-sm text-[var(--ink)] outline-none focus:bg-white",
        className,
      )}
      {...props}
    />
  );
}
