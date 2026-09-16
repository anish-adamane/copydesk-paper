"use client";

import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { BuyerCard } from "@/components/desk/buyer-card";
import { CaseFile } from "@/components/desk/case-file";
import { ConnectStrip } from "@/components/desk/connect-strip";
import { Pile } from "@/components/desk/pile";
import type { DeskSnapshot } from "@/lib/desk/types";

export function DeskShell({
  snapshot,
  initialSelectedId,
}: {
  snapshot: DeskSnapshot;
  initialSelectedId?: string | null;
}) {
  const selectedId = initialSelectedId ?? snapshot.candidates[0]?.id ?? null;
  const candidates = snapshot.candidates;
  const selected = candidates.find((row) => row.id === selectedId) ?? null;
  const review = candidates.filter((row) => !row.verdict).length;
  const keeps = candidates.filter((row) => row.verdict === "keep").length;
  const kills = candidates.filter((row) => row.verdict === "kill").length;

  return (
    <div className="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
      <ConnectStrip
        connections={snapshot.connections}
        composioMode={snapshot.composioMode}
      />

      <header className="flex flex-wrap items-baseline justify-between gap-6 border-b border-[var(--rule)] bg-[var(--paper2)] px-6 pt-4 pb-3">
        <div data-testid="buyer-card">
          <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.01em]">
            {snapshot.req.title} · inbound
          </h1>
          <p className="mt-0.5 font-mono text-[11.5px] tracking-[0.02em] text-[var(--ink-mute)]">
            {snapshot.req.location} · {snapshot.req.company} · You · {snapshot.user.email}
          </p>
        </div>
        <div className="text-right font-mono text-[11px] leading-[1.55] text-[var(--ink-mute)]">
          <div>
            <b className="font-semibold text-[var(--stamp)]">{review}</b> need review
          </div>
          <div>
            {keeps} kept · {kills} killed · {candidates.length} inbound
          </div>
          <form action={logoutAction} className="mt-1">
            <button
              type="submit"
              className="border border-[var(--rule)] px-2 py-0.5 text-[10px] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-dashed border-[var(--rule)] px-6 py-2" data-testid="req-tabs">
        {snapshot.reqs.map((req) => (
          <Link
            key={req.id}
            href={`/desk?req=${req.id}`}
            data-testid={`req-tab-${req.slug}`}
            className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.04em] ${
              req.id === snapshot.req.id
                ? "border-[var(--ink)] bg-[var(--sheet)]"
                : "border-[var(--rule)] text-[var(--ink-mute)]"
            }`}
          >
            {req.briefStatus === "thin" ? "Thin brief / empty pile" : req.title}
          </Link>
        ))}
      </nav>

      <p className="border-b border-dashed border-[var(--rule)] px-6 py-1.5 font-mono text-[10.5px] text-[var(--ink-mute)]">
        Inbound pile · agent wrote why / why-not · you keep, kill, or approve mail ·{" "}
        <kbd className="border border-[var(--rule)] bg-[var(--sheet)] px-1">j</kbd>/
        <kbd className="border border-[var(--rule)] bg-[var(--sheet)] px-1">k</kbd> move · strip
        appears when a tool session is missing
      </p>

      <div className="border-b border-[var(--rule)] px-6 py-3">
        <BuyerCard req={snapshot.req} compact />
      </div>

      <div className="grid min-h-[calc(100vh-220px)] grid-cols-1 md:grid-cols-[minmax(240px,300px)_1fr]">
        <Pile
          candidates={candidates}
          selectedId={selectedId}
          reqId={snapshot.req.id}
        />
        {selected ? (
          <CaseFile
            candidate={selected}
            gmail={snapshot.connections.gmail ?? "needs_connect"}
            ashby={snapshot.connections.ashby ?? "needs_reauth"}
            message={null}
          />
        ) : (
          <main className="px-7 py-8 font-mono text-[12px] text-[var(--ink-mute)]">
            Empty desk. Open a file from the pile, or this req has no applications.
          </main>
        )}
      </div>
    </div>
  );
}
