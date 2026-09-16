import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-32 w-full border border-[var(--ink)] bg-[var(--paper)] px-2 py-2 font-serif text-sm leading-relaxed text-[var(--ink)] outline-none focus:bg-white",
        className,
      )}
      {...props}
    />
  );
}
