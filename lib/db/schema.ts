import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const reqs = sqliteTable("reqs", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  hmName: text("hm_name").notNull(),
  hmRole: text("hm_role").notNull(),
  mustHaves: text("must_haves").notNull(),
  niceToHaves: text("nice_to_haves").notNull(),
  outOfScope: text("out_of_scope").notNull(),
  briefStatus: text("brief_status").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const candidates = sqliteTable("candidates", {
  id: text("id").primaryKey(),
  reqId: text("req_id").notNull(),
  ashbyApplicationId: text("ashby_application_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  why: text("why").notNull(),
  whyNot: text("why_not").notNull(),
  sourcePayload: text("source_payload").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const decisions = sqliteTable(
  "decisions",
  {
    id: text("id").primaryKey(),
    reqId: text("req_id").notNull(),
    candidateId: text("candidate_id").notNull(),
    userId: text("user_id").notNull(),
    verdict: text("verdict").notNull(),
    note: text("note"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("decisions_hm_req_candidate").on(
      table.userId,
      table.reqId,
      table.candidateId,
    ),
  ],
);

export const drafts = sqliteTable("drafts", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id").notNull().unique(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  revision: integer("revision").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const approveEvents = sqliteTable("approve_events", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id").notNull(),
  userId: text("user_id").notNull(),
  draftRevision: integer("draft_revision").notNull(),
  note: text("note"),
  createdAt: integer("created_at").notNull(),
});

export const connections = sqliteTable(
  "connections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    toolkit: text("toolkit").notNull(),
    status: text("status").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [uniqueIndex("connections_user_toolkit").on(table.userId, table.toolkit)],
);

export const runLogs = sqliteTable("run_logs", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id").notNull(),
  tool: text("tool").notNull(),
  status: text("status").notNull(),
  failure: text("failure"),
  createdAt: integer("created_at").notNull(),
});
