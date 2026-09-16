import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { ensureSeeded } from "@/lib/db/seed";
import { recordApprove } from "@/lib/desk/dispatch";

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  await ensureSeeded();
  const body = (await request.json()) as { candidateId?: string; note?: string };
  if (!body.candidateId) {
    return NextResponse.json({ ok: false, error: "candidateId required" }, { status: 400 });
  }
  const result = await recordApprove({
    user,
    candidateId: body.candidateId,
    note: body.note,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 403 });
}
