import type { DeskReq } from "@/lib/desk/types";

export function BuyerCard({
  req,
  compact = false,
}: {
  req: DeskReq;
  compact?: boolean;
}) {
  const thin = req.briefStatus === "thin";

  if (compact && !thin) {
    return (
      <section className="grid gap-3 md:grid-cols-3">
        <BriefColumn label="Must-haves" items={req.mustHaves} testId="must-haves" />
        <BriefColumn label="Nice-to-haves" items={req.niceToHaves} />
        <BriefColumn label="Out of scope" items={req.outOfScope} />
      </section>
    );
  }

  return (
    <section>
      {thin ? (
        <p
          data-testid="thin-brief"
          className="border border-dashed border-[var(--ink)] bg-[var(--sheet)] px-3 py-4 font-serif text-sm"
        >
          Thin brief. No must-haves, nice-to-haves, or out-of-scope on file. The
          pile cannot be scored until you fill in this brief.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          <BriefColumn label="Must-haves" items={req.mustHaves} testId="must-haves" />
          <BriefColumn label="Nice-to-haves" items={req.niceToHaves} />
          <BriefColumn label="Out of scope" items={req.outOfScope} />
        </div>
      )}
    </section>
  );
}

function BriefColumn({
  label,
  items,
  testId,
}: {
  label: string;
  items: string[];
  testId?: string;
}) {
  return (
    <div data-testid={testId}>
      <p className="mb-1 font-mono text-[10px] font-semibold tracking-[0.06em] text-[var(--ink-mute)] uppercase">
        {label}
      </p>
      <ul className="space-y-1 font-serif text-[13px] leading-snug">
        {items.map((item) => (
          <li key={item} className="border-t border-[var(--rule)] pt-1 first:border-t-0 first:pt-0">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
