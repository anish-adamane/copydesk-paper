"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { ensureSeeded } from "@/lib/db/seed";
import { candidates } from "@/lib/db/schema";
import {
  dispatchOutbound,
  markConnected,
  recordApprove,
  recordDecision,
  saveDraft,
} from "@/lib/desk/dispatch";
import { isCatalogToolkit } from "@/lib/composio/catalog";
import type { OutboundChannel } from "@/lib/composio/types";

export async function keepKillAction(formData: FormData): Promise<void> {
  await ensureSeeded();
  const user = await requireUser();
  const candidateId = String(formData.get("candidateId") ?? "");
  const verdict = String(formData.get("verdict") ?? "") as "keep" | "kill";
  if (verdict !== "keep" && verdict !== "kill") return;
  await recordDecision({ user, candidateId, verdict });
  revalidatePath("/desk");
  const row = getDb().select().from(candidates).where(eq(candidates.id, candidateId)).get();
  if (verdict === "keep" && row) {
    redirect(`/desk?req=${row.reqId}&file=${candidateId}`);
  }
}

export async function saveDraftAction(formData: FormData): Promise<void> {
  await ensureSeeded();
  const user = await requireUser();
  const candidateId = String(formData.get("candidateId") ?? "");
  const subject = String(formData.get("subject") ?? "");
  const body = String(formData.get("body") ?? "");
  await saveDraft({ user, candidateId, subject, body });
  revalidatePath("/desk");
}

export async function approveAction(formData: FormData): Promise<void> {
  await ensureSeeded();
  const user = await requireUser();
  const candidateId = String(formData.get("candidateId") ?? "");
  await recordApprove({ user, candidateId });
  revalidatePath("/desk");
}

export async function connectAction(formData: FormData): Promise<void> {
  await ensureSeeded();
  const user = await requireUser();
  const toolkit = String(formData.get("toolkit") ?? "");
  if (!isCatalogToolkit(toolkit)) return;
  const result = await markConnected({ user, toolkit });
  revalidatePath("/desk");
  if (result.authUrl) {
    redirect(result.authUrl);
  }
}

export async function outboundAction(formData: FormData): Promise<void> {
  await ensureSeeded();
  const user = await requireUser();
  const candidateId = String(formData.get("candidateId") ?? "");
  const channel = String(formData.get("channel") ?? "") as OutboundChannel;
  if (channel !== "gmail" && channel !== "ashby") return;
  await dispatchOutbound({ user, candidateId, channel });
  revalidatePath("/desk");
}
