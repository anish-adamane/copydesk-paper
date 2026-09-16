import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import * as schema from "@/lib/db/schema";

export type DeskDatabase = any;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS reqs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  hm_name TEXT NOT NULL,
  hm_role TEXT NOT NULL,
  must_haves TEXT NOT NULL,
  nice_to_haves TEXT NOT NULL,
  out_of_scope TEXT NOT NULL,
  brief_status TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  req_id TEXT NOT NULL,
  ashby_application_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  why TEXT NOT NULL,
  why_not TEXT NOT NULL,
  source_payload TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  req_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  verdict TEXT NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS decisions_hm_req_candidate
  ON decisions (user_id, req_id, candidate_id);
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  revision INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS approve_events (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  draft_revision INTEGER NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  toolkit TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS connections_user_toolkit
  ON connections (user_id, toolkit);
CREATE TABLE IF NOT EXISTS run_logs (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  status TEXT NOT NULL,
  failure TEXT,
  created_at INTEGER NOT NULL
);
`;

export function sqlitePath() {
  if (process.env.SQLITE_PATH) return process.env.SQLITE_PATH;
  if (process.env.VERCEL) return "/tmp/copydesk.db";
  return path.join(process.cwd(), "data", "desk.db");
}

export function useSqlJs() {
  return Boolean(process.env.VERCEL) || process.env.DESK_DB === "sqljs";
}

const nodeRequire = createRequire(import.meta.url);

function createBetterSqlite(filePath = sqlitePath()) {
  const Database = nodeRequire("better-sqlite3");
  const { drizzle } = nodeRequire("drizzle-orm/better-sqlite3");
  if (filePath !== ":memory:") {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(SCHEMA_SQL);
  return drizzle(sqlite, { schema });
}

const globalForDb = globalThis as unknown as {
  deskDb?: DeskDatabase;
  deskDbPath?: string;
  sqlJsRaw?: any;
};

async function createSqlJs(filePath = sqlitePath()) {
  const initSqlJs = (await import("sql.js")).default;
  const { drizzle } = await import("drizzle-orm/sql-js");
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
  let sqlite: any;
  if (filePath !== ":memory:" && fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
    sqlite = new SQL.Database(fs.readFileSync(filePath));
  } else {
    if (filePath !== ":memory:") fs.mkdirSync(path.dirname(filePath), { recursive: true });
    sqlite = new SQL.Database();
  }
  sqlite.exec(SCHEMA_SQL);
  globalForDb.sqlJsRaw = sqlite;
  return drizzle(sqlite, { schema });
}

export function persistDb() {
  const filePath = sqlitePath();
  if (!useSqlJs() || !globalForDb.sqlJsRaw || filePath === ":memory:") return;
  fs.writeFileSync(filePath, Buffer.from(globalForDb.sqlJsRaw.export()));
}

export async function initDb() {
  const filePath = sqlitePath();
  if (globalForDb.deskDb && globalForDb.deskDbPath === filePath) {
    return globalForDb.deskDb;
  }
  globalForDb.deskDb = useSqlJs()
    ? await createSqlJs(filePath)
    : createBetterSqlite(filePath);
  globalForDb.deskDbPath = filePath;
  return globalForDb.deskDb;
}

export function getDb() {
  const filePath = sqlitePath();
  if (!globalForDb.deskDb || globalForDb.deskDbPath !== filePath) {
    if (useSqlJs()) {
      throw new Error("Database not initialized. Call initDb() / ensureSeeded() first.");
    }
    globalForDb.deskDb = createBetterSqlite(filePath);
    globalForDb.deskDbPath = filePath;
  }
  return globalForDb.deskDb;
}

export function resetDbSingleton() {
  globalForDb.deskDb = undefined;
  globalForDb.deskDbPath = undefined;
  globalForDb.sqlJsRaw = undefined;
}
