import { Stamp } from "@/components/desk/stamp";
import type { DeskCandidate } from "@/lib/desk/types";
import { qaLabelFor } from "@/lib/fixtures/billing-req";
import { detectSourceAnomalies } from "@/lib/fixtures/source-anomalies";
import { cn } from "@/lib/utils";

export function CandidateSlip({
  candidate,
  pile,
  selected,
  index,
}: {
  candidate: DeskCandidate;
  pile: DeskCandidate[];
  selected: boolean;
  index: number;
}) {
  const anomalies = detectSourceAnomalies(
    candidate.source,
    pile.map((row) => row.source),
  );
  const qaLabel = candidate.source.qaLabel ?? qaLabelFor(candidate.source.applicationId);
  const status =
    candidate.verdict === "keep" ? "kept" : candidate.verdict === "kill" ? "killed" : "review";
  const phantom =
    anomalies.includes("claimed_employer_missing_from_linkedin") ||
    anomalies.includes("linkedin_fetch_404");
  const duplicate = anomalies.includes("duplicate_linkedin_identity");

  return (
    <article
      data-testid={`candidate-${candidate.id}`}
      data-selected={selected ? "true" : "false"}
      className={cn(
        "grid grid-cols-[1.4rem_1fr_auto] items-start gap-2 border-b border-[var(--rule)] px-3 py-2 text-[15px]",
        selected && "bg-[var(--sheet)] shadow-[inset_3px_0_0_var(--stamp)]",
        !selected && "hover:bg-[#efe4cc]",
      )}
    >
      <span className="pt-0.5 font-mono text-[11px] text-[var(--ink-mute)]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <div className="font-semibold">
          {candidate.name}
          {duplicate ? " ★" : ""}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-[var(--ink-mute)]">
          Ashby apply · mock {qaLabel}
          {phantom ? " · phantom" : ""}
          {duplicate ? " · duplicate" : ""}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          data-testid={
            status === "kept" ? "verdict-keep" : status === "killed" ? "verdict-kill" : undefined
          }
          className={cn(
            "border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.04em] uppercase",
            status === "review" &&
              "border-[var(--stamp)] bg-[var(--stamp-soft)] text-[var(--stamp)]",
            status === "kept" &&
              "border-[var(--kept)] bg-[var(--kept-bg)] text-[var(--kept)]",
            status === "killed" &&
              "border-[var(--kill)] text-[var(--kill)] line-through opacity-70",
          )}
        >
          {status === "kept" ? "Keep" : status === "killed" ? "Kill" : status}
        </span>
        <Stamp tone={qaLabel === "phantom" ? "blocked" : qaLabel === "thin" ? "warn" : "ink"} testId="qa-label">
          {qaLabel}
        </Stamp>
      </div>
    </article>
  );
}
