import { and, desc, eq } from "drizzle-orm";
import type { AshbyApplication, ConnectionStatus } from "@/lib/composio/types";
import { composioMode } from "@/lib/composio";
import {
  approveEvents,
  candidates,
  connections,
  decisions,
  drafts,
  reqs,
  runLogs,
} from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/db/seed";
import type {
  DeskCandidate,
  DeskReq,
  DeskSnapshot,
  RunStamp,
  Verdict,
} from "@/lib/desk/types";
import type { SessionUser } from "@/lib/auth/session";

function parseReq(row: typeof reqs.$inferSelect): DeskReq {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    company: row.company,
    location: row.location,
    hmName: row.hmName,
    hmRole: row.hmRole,
    mustHaves: JSON.parse(row.mustHaves) as string[],
    niceToHaves: JSON.parse(row.niceToHaves) as string[],
    outOfScope: JSON.parse(row.outOfScope) as string[],
    briefStatus: row.briefStatus as "complete" | "thin",
  };
}

export async function loadDesk(user: SessionUser, reqId?: string): Promise<DeskSnapshot> {
  const db = await ensureSeeded();
  const allReqs = db.select().from(reqs).all();
  if (allReqs.length === 0) {
    throw new Error("Desk has no reqs");
  }
  const reqRow = reqId
    ? allReqs.find((row) => row.id === reqId) ?? allReqs[0]
    : allReqs.find((row) => row.briefStatus === "complete") ?? allReqs[0];

  const req = parseReq(reqRow);
  const candidateRows = db
    .select()
    .from(candidates)
    .where(eq(candidates.reqId, req.id))
    .all();

  const deskCandidates: DeskCandidate[] = candidateRows.map((row) => {
    const decision = db
      .select()
      .from(decisions)
      .where(
        and(
          eq(decisions.userId, user.id),
          eq(decisions.reqId, req.id),
          eq(decisions.candidateId, row.id),
        ),
      )
      .get();
    const draft = db.select().from(drafts).where(eq(drafts.candidateId, row.id)).get();
    const approve = db
      .select()
      .from(approveEvents)
      .where(eq(approveEvents.candidateId, row.id))
      .orderBy(desc(approveEvents.createdAt))
      .get();
    const logs = db
      .select()
      .from(runLogs)
      .where(eq(runLogs.candidateId, row.id))
      .orderBy(desc(runLogs.createdAt))
      .all()
      .map(
        (log) =>
          ({
            id: log.id,
            tool: log.tool,
            status: log.status as RunStamp["status"],
            failure: log.failure,
            createdAt: log.createdAt,
          }) satisfies RunStamp,
      );
    const latestByTool: DeskCandidate["latestByTool"] = {};
    for (const log of logs) {
      if (!latestByTool[log.tool]) latestByTool[log.tool] = log;
    }

    return {
      id: row.id,
      reqId: row.reqId,
      ashbyApplicationId: row.ashbyApplicationId,
      name: row.name,
      email: row.email,
      why: row.why,
      whyNot: row.whyNot,
      source: JSON.parse(row.sourcePayload) as AshbyApplication,
      verdict: (decision?.verdict as Verdict | undefined) ?? null,
      decisionUpdatedAt: decision?.updatedAt ?? null,
      draft: {
        subject: draft?.subject ?? "",
        body: draft?.body ?? "",
        revision: draft?.revision ?? 1,
      },
      approve: {
        recorded: Boolean(approve),
        draftRevision: approve?.draftRevision ?? null,
        createdAt: approve?.createdAt ?? null,
      },
      runLogs: logs,
      latestByTool,
    };
  });

  const connectionRows = db
    .select()
    .from(connections)
    .where(eq(connections.userId, user.id))
    .all();
  const statusMap: Record<string, ConnectionStatus> = {};
  for (const row of connectionRows) {
    statusMap[row.toolkit] = row.status as ConnectionStatus;
  }
  if (!statusMap.gmail) statusMap.gmail = "needs_connect";
  if (!statusMap.ashby) statusMap.ashby = "needs_reauth";

  return {
    user,
    req,
    reqs: allReqs.map((row) => ({
      id: row.id,
      title: row.title,
      briefStatus: row.briefStatus as "complete" | "thin",
      slug: row.slug,
    })),
    candidates: deskCandidates,
    connections: statusMap,
    composioMode: composioMode(),
  };
}
