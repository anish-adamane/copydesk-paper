import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Stamp({
  children,
  tone = "ink",
  className,
  testId,
}: {
  children: ReactNode;
  tone?: "ink" | "keep" | "kill" | "warn" | "ok" | "blocked";
  className?: string;
  testId?: string;
}) {
  const tones = {
    ink: "border-[var(--ink)] text-[var(--ink)]",
    keep: "border-[var(--stamp-keep)] text-[var(--stamp-keep)]",
    kill: "border-[var(--stamp-kill)] text-[var(--stamp-kill)]",
    warn: "border-[#8a5a12] text-[#8a5a12]",
    ok: "border-[var(--stamp-keep)] text-[var(--stamp-keep)]",
    blocked: "border-[var(--stamp-kill)] text-[var(--stamp-kill)]",
  } as const;

  return (
    <span
      data-slot="stamp"
      data-testid={testId}
      className={cn(
        "inline-flex rotate-[-2deg] items-center border-2 px-1.5 py-0.5 font-mono text-[9px] leading-none font-bold tracking-[0.16em] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
