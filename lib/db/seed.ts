import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb, initDb, persistDb, type DeskDatabase } from "@/lib/db/client";
import {
  approveEvents,
  candidates,
  connections,
  decisions,
  drafts,
  reqs,
  runLogs,
  users,
} from "@/lib/db/schema";
import {
  BILLING_APPLICATIONS,
  BILLING_REQ,
  THIN_REQ,
  defaultDraft,
  deriveWhyAndWhyNot,
} from "@/lib/fixtures/billing-req";
import { detectSourceAnomalies } from "@/lib/fixtures/source-anomalies";

export const DEMO_USER = {
  id: "usr_hm",
  email: "hm@copydesk.local",
  password: "blotter-14",
  name: "Head of Engineering",
};

function now() {
  return Date.now();
}

export async function seedDesk(passed?: DeskDatabase) {
  const db = passed ?? (await initDb());
  const existing = db.select().from(reqs).all();
  if (existing.length > 0) return { seeded: false as const };

  const createdAt = now();
  const passwordHash = bcrypt.hashSync(DEMO_USER.password, 10);

  db.insert(users)
    .values({
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      passwordHash,
      name: DEMO_USER.name,
      createdAt,
    })
    .run();

  for (const req of [BILLING_REQ, THIN_REQ]) {
    db.insert(reqs)
      .values({
        id: req.id,
        slug: req.slug,
        title: req.title,
        company: req.company,
        location: req.location,
        hmName: req.hmName,
        hmRole: req.hmRole,
        mustHaves: JSON.stringify(req.mustHaves),
        niceToHaves: JSON.stringify(req.niceToHaves),
        outOfScope: JSON.stringify(req.outOfScope),
        briefStatus: req.briefStatus,
        createdAt,
      })
      .run();
  }

  for (const application of BILLING_APPLICATIONS) {
    const { why, whyNot } = deriveWhyAndWhyNot(application);
    const candidateId = `cand_${application.applicationId}`;
    db.insert(candidates)
      .values({
        id: candidateId,
        reqId: BILLING_REQ.id,
        ashbyApplicationId: application.applicationId,
        name: application.candidate.name,
        email: application.candidate.email,
        why,
        whyNot,
        sourcePayload: JSON.stringify(application),
        createdAt,
      })
      .run();

    const draft = defaultDraft(application);
    db.insert(drafts)
      .values({
        id: `draft_${candidateId}`,
        candidateId,
        subject: draft.subject,
        body: draft.body,
        revision: 1,
        updatedAt: createdAt,
      })
      .run();

    const anomalies = detectSourceAnomalies(application, BILLING_APPLICATIONS);
    if (application.linkedin.fetchStatus === "404") {
      db.insert(runLogs)
        .values({
          id: `run_${candidateId}_ashby_li`,
          candidateId,
          tool: "ashby",
          status: "failed",
          failure: "LinkedIn-linked profile fetchStatus=404",
          createdAt,
        })
        .run();
    } else if (anomalies.includes("claimed_employer_missing_from_linkedin")) {
      db.insert(runLogs)
        .values({
          id: `run_${candidateId}_ashby_phantom`,
          candidateId,
          tool: "ashby",
          status: "failed",
          failure: `claimedEmployer ${application.application.claimedEmployer} missing from LinkedIn-linked listedEmployers`,
          createdAt,
        })
        .run();
    } else if (anomalies.includes("duplicate_linkedin_identity")) {
      db.insert(runLogs)
        .values({
          id: `run_${candidateId}_ashby_dup`,
          candidateId,
          tool: "ashby",
          status: "ok",
          failure: "Noisy identity — duplicate LinkedIn-linked profileUrl",
          createdAt,
        })
        .run();
    } else {
      db.insert(runLogs)
        .values({
          id: `run_${candidateId}_ashby`,
          candidateId,
          tool: "ashby",
          status: "ok",
          failure: null,
          createdAt,
        })
        .run();
    }
  }

  db.insert(connections)
    .values([
      {
        id: "conn_gmail",
        userId: DEMO_USER.id,
        toolkit: "gmail",
        status: "needs_connect",
        updatedAt: createdAt,
      },
      {
        id: "conn_ashby",
        userId: DEMO_USER.id,
        toolkit: "ashby",
        status: "needs_reauth",
        updatedAt: createdAt,
      },
    ])
    .run();

  persistDb();
  return { seeded: true as const };
}

function migrateToHiringManager(db: DeskDatabase) {
  const passwordHash = bcrypt.hashSync(DEMO_USER.password, 10);
  for (const row of db.select().from(users).all()) {
    const leftoverJunior =
      row.id === "usr_junior" ||
      row.email === "junior@copydesk.local" ||
      row.name.toLowerCase().includes("junior");
    if (!leftoverJunior) continue;
    db.update(users)
      .set({
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        passwordHash,
      })
      .where(eq(users.id, row.id))
      .run();
  }

  db.update(reqs).set({ hmRole: "" }).run();

  for (const draft of db.select().from(drafts).all()) {
    if (!draft.body.includes("schedule a screen with our Head of Engineering")) {
      continue;
    }
    db.update(drafts)
      .set({
        body: draft.body.replace(
          "I would like to schedule a screen with our Head of Engineering.",
          "I would like to schedule a screen.",
        ),
      })
      .where(eq(drafts.id, draft.id))
      .run();
  }
}

export async function ensureSeeded() {
  const db = await initDb();
  await seedDesk(db);
  migrateToHiringManager(db);
  persistDb();
  return db;
}

export function wipeDesk(db: DeskDatabase = getDb()) {
  db.delete(runLogs).run();
  db.delete(approveEvents).run();
  db.delete(drafts).run();
  db.delete(decisions).run();
  db.delete(candidates).run();
  db.delete(connections).run();
  db.delete(reqs).run();
  db.delete(users).run();
}

export async function reseedDesk(passed?: DeskDatabase) {
  const db = passed ?? (await initDb());
  wipeDesk(db);
  return seedDesk(db);
}

export function countCandidatesForReq(reqId: string, db: DeskDatabase = getDb()) {
  return db.select().from(candidates).where(eq(candidates.reqId, reqId)).all().length;
}
