import { and, desc, eq } from "drizzle-orm";
import { assertCanDispatch } from "@/lib/gate/approve";
import { getDeskPipes } from "@/lib/composio";
import type { ConnectionStatus, OutboundChannel } from "@/lib/composio/types";
import { getDb, persistDb } from "@/lib/db/client";
import {
  approveEvents,
  candidates,
  connections,
  decisions,
  drafts,
  runLogs,
} from "@/lib/db/schema";
import type { SessionUser } from "@/lib/auth/session";

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function latestApprove(candidateId: string) {
  const db = getDb();
  return db
    .select()
    .from(approveEvents)
    .where(eq(approveEvents.candidateId, candidateId))
    .orderBy(desc(approveEvents.createdAt))
    .get();
}

export async function recordDecision(input: {
  user: SessionUser;
  candidateId: string;
  verdict: "keep" | "kill";
}) {
  const db = getDb();
  const candidate = db
    .select()
    .from(candidates)
    .where(eq(candidates.id, input.candidateId))
    .get();
  if (!candidate) throw new Error("Candidate not found");
  const existing = db
    .select()
    .from(decisions)
    .where(
      and(
        eq(decisions.userId, input.user.id),
        eq(decisions.reqId, candidate.reqId),
        eq(decisions.candidateId, input.candidateId),
      ),
    )
    .get();
  const ts = Date.now();
  if (existing) {
    db.update(decisions)
      .set({ verdict: input.verdict, updatedAt: ts })
      .where(eq(decisions.id, existing.id))
      .run();
  } else {
    db.insert(decisions)
      .values({
        id: id("dec"),
        reqId: candidate.reqId,
        candidateId: input.candidateId,
        userId: input.user.id,
        verdict: input.verdict,
        createdAt: ts,
        updatedAt: ts,
      })
      .run();
  }
  persistDb();
  return { ok: true as const };
}

export async function saveDraft(input: {
  user: SessionUser;
  candidateId: string;
  subject: string;
  body: string;
}) {
  const db = getDb();
  const existing = db
    .select()
    .from(drafts)
    .where(eq(drafts.candidateId, input.candidateId))
    .get();
  const ts = Date.now();
  if (!existing) {
    db.insert(drafts)
      .values({
        id: id("draft"),
        candidateId: input.candidateId,
        subject: input.subject,
        body: input.body,
        revision: 1,
        updatedAt: ts,
      })
      .run();
    persistDb();
    return { revision: 1 };
  }
  const changed = existing.subject !== input.subject || existing.body !== input.body;
  const revision = changed ? existing.revision + 1 : existing.revision;
  db.update(drafts)
    .set({
      subject: input.subject,
      body: input.body,
      revision,
      updatedAt: ts,
    })
    .where(eq(drafts.id, existing.id))
    .run();
  persistDb();
  return { revision };
}

export async function recordApprove(input: {
  user: SessionUser;
  candidateId: string;
  note?: string;
}) {
  const db = getDb();
  const decision = db
    .select()
    .from(decisions)
    .where(
      and(
        eq(decisions.userId, input.user.id),
        eq(decisions.candidateId, input.candidateId),
      ),
    )
    .get();
  if (decision?.verdict !== "keep") {
    return {
      ok: false as const,
      code: "NOT_KEEP",
      error: "Approve only applies to a Keep.",
    };
  }
  const draft = db
    .select()
    .from(drafts)
    .where(eq(drafts.candidateId, input.candidateId))
    .get();
  if (!draft) {
    return { ok: false as const, code: "NO_DRAFT", error: "No draft on file." };
  }
  db.insert(approveEvents)
    .values({
      id: id("appr"),
      candidateId: input.candidateId,
      userId: input.user.id,
      draftRevision: draft.revision,
      note: input.note ?? "Approve recorded on desk",
      createdAt: Date.now(),
    })
    .run();
  db.insert(runLogs)
    .values({
      id: id("run"),
      candidateId: input.candidateId,
      tool: "approve",
      status: "ok",
      failure: null,
      createdAt: Date.now(),
    })
    .run();
  persistDb();
  return { ok: true as const, draftRevision: draft.revision };
}

export function connectionStatus(
  userId: string,
  toolkit: string,
): ConnectionStatus {
  const row = getDb()
    .select()
    .from(connections)
    .where(and(eq(connections.userId, userId), eq(connections.toolkit, toolkit)))
    .get();
  return (row?.status as ConnectionStatus) ?? "needs_connect";
}

export async function markConnected(input: {
  user: SessionUser;
  toolkit: string;
}) {
  const db = getDb();
  const pipes = getDeskPipes();
  const result = await pipes.connect(input.toolkit);
  const existing = db
    .select()
    .from(connections)
    .where(
      and(eq(connections.userId, input.user.id), eq(connections.toolkit, input.toolkit)),
    )
    .get();
  const status = result.authUrl ? "needs_connect" : "connected";
  if (existing) {
    db.update(connections)
      .set({ status, updatedAt: Date.now() })
      .where(eq(connections.id, existing.id))
      .run();
  } else {
    db.insert(connections)
      .values({
        id: id("conn"),
        userId: input.user.id,
        toolkit: input.toolkit,
        status,
        updatedAt: Date.now(),
      })
      .run();
  }
  persistDb();
  return { ...result, status };
}

export async function dispatchOutbound(input: {
  user: SessionUser;
  candidateId: string;
  channel: OutboundChannel;
}) {
  const db = getDb();
  const candidate = db
    .select()
    .from(candidates)
    .where(eq(candidates.id, input.candidateId))
    .get();
  if (!candidate) {
    return { ok: false as const, code: "NOT_FOUND", error: "Candidate not found" };
  }
  const decision = db
    .select()
    .from(decisions)
    .where(
      and(
        eq(decisions.userId, input.user.id),
        eq(decisions.candidateId, input.candidateId),
      ),
    )
    .get();
  const draft = db
    .select()
    .from(drafts)
    .where(eq(drafts.candidateId, input.candidateId))
    .get();
  const approve = latestApprove(input.candidateId);
  const toolkit = input.channel === "gmail" ? "gmail" : "ashby";
  const conn = connectionStatus(input.user.id, toolkit);

  const block = assertCanDispatch({
    channel: input.channel,
    verdict: (decision?.verdict as "keep" | "kill" | null) ?? null,
    approveRecorded: Boolean(approve),
    approveDraftRevision: approve?.draftRevision ?? null,
    currentDraftRevision: draft?.revision ?? 1,
    connectionStatus: conn,
    email: candidate.email,
    ashbyApplicationId: candidate.ashbyApplicationId,
  });

  if (block) {
    db.insert(runLogs)
      .values({
        id: id("run"),
        candidateId: input.candidateId,
        tool: input.channel,
        status: "blocked",
        failure: `${block.code}: ${block.message}`,
        createdAt: Date.now(),
      })
      .run();
    persistDb();
    return { ok: false as const, code: block.code, error: block.message };
  }

  const pipes = getDeskPipes();

  if (input.channel === "gmail") {
    const sent = await pipes.sendGmail({
      to: candidate.email as string,
      subject: draft?.subject ?? "",
      body: draft?.body ?? "",
    });
    if (!sent.ok) {
      db.insert(runLogs)
        .values({
          id: id("run"),
          candidateId: input.candidateId,
          tool: "gmail",
          status: "failed",
          failure: sent.failure,
          createdAt: Date.now(),
        })
        .run();
      return { ok: false as const, code: "SEND_FAILED", error: sent.failure };
    }
    db.insert(runLogs)
      .values({
        id: id("run"),
        candidateId: input.candidateId,
        tool: "gmail",
        status: "ok",
        failure: null,
        createdAt: Date.now(),
      })
      .run();
    return { ok: true as const, channel: input.channel };
  }

  const written = await pipes.writeAshbyStage({
    applicationId: candidate.ashbyApplicationId,
    stage: "Reached out",
  });
  if (!written.ok) {
    db.insert(runLogs)
      .values({
        id: id("run"),
        candidateId: input.candidateId,
        tool: "ashby",
        status: "failed",
        failure: written.failure,
        createdAt: Date.now(),
      })
      .run();
    return { ok: false as const, code: "ATS_FAILED", error: written.failure };
  }
  db.insert(runLogs)
    .values({
      id: id("run"),
      candidateId: input.candidateId,
      tool: "ashby",
      status: "ok",
      failure: null,
      createdAt: Date.now(),
    })
    .run();
  return { ok: true as const, channel: input.channel };
}
