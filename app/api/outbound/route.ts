import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { ensureSeeded } from "@/lib/db/seed";
import { dispatchOutbound } from "@/lib/desk/dispatch";
import type { OutboundChannel } from "@/lib/composio/types";

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  await ensureSeeded();
  const body = (await request.json()) as {
    candidateId?: string;
    channel?: OutboundChannel;
  };
  if (!body.candidateId || (body.channel !== "gmail" && body.channel !== "ashby")) {
    return NextResponse.json(
      { ok: false, error: "candidateId and channel (gmail|ashby) required" },
      { status: 400 },
    );
  }
  const result = await dispatchOutbound({
    user,
    candidateId: body.candidateId,
    channel: body.channel,
  });
  const status = result.ok ? 200 : result.code === "NEEDS_APPROVE" || result.code === "NEEDS_CONNECT" || result.code === "NEEDS_REAUTH" || result.code === "NOT_KEEP" || result.code === "DRAFT_CHANGED" ? 403 : 400;
  return NextResponse.json(result, { status });
}
