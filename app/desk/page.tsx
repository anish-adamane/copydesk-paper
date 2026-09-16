import { redirect } from "next/navigation";
import { DeskShell } from "@/components/desk/desk-shell";
import { readSession } from "@/lib/auth/session";
import { loadDesk } from "@/lib/desk/queries";

export const dynamic = "force-dynamic";

export default async function DeskPage({
  searchParams,
}: {
  searchParams: Promise<{ req?: string; file?: string }>;
}) {
  const user = await readSession();
  if (!user) redirect("/login");
  const params = await searchParams;
  const snapshot = await loadDesk(user, params.req);
  return <DeskShell key={`${snapshot.req.id}:${params.file ?? ""}`} snapshot={snapshot} initialSelectedId={params.file ?? null} />;
}
