import Link from "next/link";
import { CandidateSlip } from "@/components/desk/candidate-slip";
import type { DeskCandidate } from "@/lib/desk/types";

export function EmptyPile() {
  return (
    <aside
      data-testid="empty-pile"
      className="border-r border-[var(--rule)] px-4 py-16 text-center md:max-h-[calc(100vh-220px)]"
    >
      <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--ink-mute)] uppercase">
        Empty pile
      </p>
      <p className="mt-2 font-display text-xl">No Ashby applications on this req.</p>
      <p className="mx-auto mt-2 max-w-xs font-serif text-sm text-[var(--ink-mute)]">
        The inbound folder is empty. Nothing to keep, kill, or stamp.
      </p>
    </aside>
  );
}

export function Pile({
  candidates,
  selectedId,
  reqId,
}: {
  candidates: DeskCandidate[];
  selectedId: string | null;
  reqId: string;
}) {
  if (candidates.length === 0) return <EmptyPile />;

  return (
    <aside className="max-h-[220px] overflow-y-auto border-b border-[var(--rule)] md:max-h-[calc(100vh-220px)] md:border-r md:border-b-0">
      {candidates.map((candidate, index) => (
        <Link
          key={candidate.id}
          href={`/desk?req=${reqId}&file=${candidate.id}`}
          className="block"
        >
          <CandidateSlip
            candidate={candidate}
            pile={candidates}
            selected={selectedId === candidate.id}
            index={index}
          />
        </Link>
      ))}
    </aside>
  );
}
