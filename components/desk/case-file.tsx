import { approveAction, keepKillAction, outboundAction, saveDraftAction } from "@/app/actions/desk";
import { Stamp } from "@/components/desk/stamp";
import type { ConnectionStatus } from "@/lib/composio/types";
import type { DeskCandidate } from "@/lib/desk/types";

export function CaseFile({
  candidate,
  gmail,
  ashby,
  pending,
  message,
}: {
  candidate: DeskCandidate;
  gmail: ConnectionStatus;
  ashby: ConnectionStatus;
  pending?: boolean;
  message?: string | null;
}) {
  const approveReady =
    candidate.verdict === "keep" &&
    candidate.approve.recorded &&
    candidate.approve.draftRevision === candidate.draft.revision;
  const sendBlockedReason = !approveReady
    ? candidate.verdict !== "keep"
      ? "Keep first, then Approve."
      : candidate.approve.recorded
        ? "Draft changed after Approve. Re-approve."
        : "No Approve on the log."
    : gmail !== "connected"
      ? `Gmail ${gmail.replaceAll("_", " ")}.`
      : null;
  const ashbyBlockedReason = !approveReady
    ? sendBlockedReason
    : ashby !== "connected"
      ? `Ashby ${ashby.replaceAll("_", " ")}.`
      : null;
  const stamp =
    candidate.verdict === "keep"
      ? "KEPT"
      : candidate.verdict === "kill"
        ? "KILLED"
        : "NEEDS REVIEW";
  const stamps = Object.values(candidate.latestByTool).filter(Boolean);

  return (
    <main data-testid="case-file" className="overflow-y-auto px-7 py-5 md:max-h-[calc(100vh-220px)]">
      <div className="mb-4 flex items-start justify-between gap-4 border-b-2 border-[var(--ink)] pb-3">
        <div>
          <h2 className="m-0 text-[1.55rem] font-bold">
            {candidate.name}{" "}
            <span
              className={`ml-2 inline-block rotate-[-6deg] border-2 px-2 py-1 font-mono text-xs font-semibold tracking-[0.08em] uppercase ${
                candidate.verdict === "keep"
                  ? "border-[var(--kept)] text-[var(--kept)]"
                  : candidate.verdict === "kill"
                    ? "border-[var(--kill)] text-[var(--kill)]"
                    : "border-[var(--stamp)] text-[var(--stamp)]"
              }`}
            >
              {stamp}
            </span>
          </h2>
          <p className="mt-1 text-[15px] text-[var(--ink-mute)]">
            {candidate.source.application.claimedTitle ?? "title null"} ·{" "}
            {candidate.source.linkedin.yearsExperience ?? "yearsExperience null"} yrs ·{" "}
            {candidate.source.linkedin.location ?? "location null"}
          </p>
        </div>
        <div className="text-right font-mono text-[11px] leading-[1.5] text-[var(--ink-mute)]">
          provenance
          <br />
          <strong className="text-[var(--ink)]">Ashby apply</strong>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-dashed border-[var(--rule)] py-2 font-mono text-[11.5px] text-[var(--ink-mute)]">
        <span>
          yrs <b className="font-medium text-[var(--ink)]">{candidate.source.linkedin.yearsExperience ?? "null"}</b>
        </span>
        <span>
          source <b className="font-medium text-[var(--ink)]">Ashby</b>
        </span>
        <span>
          LinkedIn-linked{" "}
          <b className="font-medium text-[var(--ink)]">
            {candidate.source.linkedin.fetchStatus} ·{" "}
            {candidate.source.linkedin.currentTitle ?? "title null"} @{" "}
            {candidate.source.linkedin.currentEmployer ?? "employer null"}
          </b>
        </span>
        <span>
          listedEmployers [
          {candidate.source.linkedin.listedEmployers.join(", ") || "empty"}]
        </span>
      </div>

      <div className="mb-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="mb-2 border-b border-[var(--rule)] pb-1 font-mono text-[11px] font-semibold tracking-[0.06em] text-[var(--kept)] uppercase">
            Why
          </h3>
          <p data-testid="why" className="m-0 text-[16.5px] leading-[1.55]">
            {candidate.why}
          </p>
        </div>
        <div>
          <h3 className="mb-2 border-b border-[var(--rule)] pb-1 font-mono text-[11px] font-semibold tracking-[0.06em] text-[var(--stamp)] uppercase">
            Why not
          </h3>
          <p data-testid="why-not" className="m-0 text-[16.5px] leading-[1.55]">
            {candidate.whyNot}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <form action={keepKillAction}>
          <input type="hidden" name="candidateId" value={candidate.id} />
          <input type="hidden" name="verdict" value="keep" />
          <button
            type="submit"
            disabled={pending}
            data-testid={`keep-${candidate.id}`}
            className="border-[1.5px] border-[var(--kept)] px-3 py-2 font-mono text-xs font-medium text-[var(--kept)] hover:bg-[var(--kept)] hover:text-white disabled:opacity-40"
          >
            Keep
          </button>
        </form>
        <form action={keepKillAction}>
          <input type="hidden" name="candidateId" value={candidate.id} />
          <input type="hidden" name="verdict" value="kill" />
          <button
            type="submit"
            disabled={pending}
            data-testid={`kill-${candidate.id}`}
            className="border-[1.5px] border-[var(--ink)] px-3 py-2 font-mono text-xs font-medium hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-40"
          >
            Kill
          </button>
        </form>
        <form action={approveAction}>
          <input type="hidden" name="candidateId" value={candidate.id} />
          <button
            type="submit"
            disabled={pending || candidate.verdict !== "keep"}
            data-testid="approve"
            className="border-[1.5px] border-[var(--stamp)] bg-[var(--stamp)] px-3 py-2 font-mono text-xs font-medium text-[var(--sheet)] hover:bg-[#8f1a12] disabled:opacity-40"
          >
            Approve send
          </button>
        </form>
      </div>

      <div className="border border-[var(--rule)] bg-[var(--sheet)] px-4 py-4">
        <h3 className="m-0 mb-2 font-mono text-[11px] tracking-[0.05em] text-[var(--ink-mute)] uppercase">
          Draft outreach — will not send until you approve
        </h3>
        <p className="mb-2 font-mono text-[10.5px] text-[var(--stamp)]">
          Agent may spend on email only after your click. No ATS push without ask.
          Needs Gmail session.
        </p>
        <form action={saveDraftAction} className="flex flex-col gap-2">
          <input type="hidden" name="candidateId" value={candidate.id} />
          <input
            name="subject"
            key={`${candidate.id}-${candidate.draft.revision}-subject`}
            defaultValue={candidate.draft.subject}
            className="border border-[var(--rule)] bg-[var(--paper)] px-2 py-2 font-mono text-[13px]"
          />
          <textarea
            name="body"
            key={`${candidate.id}-${candidate.draft.revision}-body`}
            defaultValue={candidate.draft.body}
            className="min-h-[110px] border border-[var(--rule)] bg-[var(--paper)] px-2.5 py-2 font-serif text-[15px] leading-[1.5] text-[var(--ink)]"
          />
          <button
            type="submit"
            disabled={pending}
            className="self-start border-[1.5px] border-[var(--ink)] px-3 py-2 font-mono text-xs hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            Save draft (rev {candidate.draft.revision})
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          <form action={outboundAction}>
            <input type="hidden" name="candidateId" value={candidate.id} />
            <input type="hidden" name="channel" value="gmail" />
            <button
              type="submit"
              disabled={pending || Boolean(sendBlockedReason)}
              data-testid="send-gmail"
              title={sendBlockedReason ?? "Send via Gmail"}
              className="border-[1.5px] border-[var(--stamp)] bg-[var(--stamp)] px-3 py-2 font-mono text-xs font-medium text-[var(--sheet)] disabled:opacity-40"
            >
              Approve &amp; send
            </button>
          </form>
          <form action={outboundAction}>
            <input type="hidden" name="candidateId" value={candidate.id} />
            <input type="hidden" name="channel" value="ashby" />
            <button
              type="submit"
              disabled={pending || Boolean(ashbyBlockedReason)}
              data-testid="write-ashby"
              title={ashbyBlockedReason ?? "Write Ashby stage"}
              className="border-[1.5px] border-[var(--ink)] px-3 py-2 font-mono text-xs disabled:opacity-40"
            >
              Write Ashby stage
            </button>
          </form>
        </div>
        {sendBlockedReason ? (
          <p data-testid="gate-reason" className="mt-2 font-serif text-sm text-[var(--stamp)]">
            {sendBlockedReason} Send stays blocked.
          </p>
        ) : null}
        {candidate.approve.recorded ? (
          <div className="mt-2">
            <Stamp tone="kill">
              Approved rev {candidate.approve.draftRevision} · same click for email + Ashby
            </Stamp>
          </div>
        ) : null}
        {message ? (
          <p data-testid="desk-message" className="mt-2 font-serif text-sm">
            {message}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" data-testid="run-stamps">
        {stamps.length === 0 ? (
          <Stamp tone="ink">No runs</Stamp>
        ) : (
          stamps.map((stampRow) => (
            <Stamp
              key={stampRow!.id}
              tone={
                stampRow!.status === "ok"
                  ? "ok"
                  : stampRow!.status === "blocked"
                    ? "blocked"
                    : "warn"
              }
            >
              {stampRow!.tool} · {stampRow!.status}
              {stampRow!.failure ? ` · ${stampRow!.failure}` : ""}
            </Stamp>
          ))
        )}
      </div>
    </main>
  );
}
