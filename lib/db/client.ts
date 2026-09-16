import t from"node:fs";import E from"node:path";import{createRequire as c}from"node:module";import O from"better-sqlite3";import{drizzle as X}from"drizzle-orm/better-sqlite3";import{drizzle as u}from"drizzle-orm/sql-js";import*as n from"@/lib/db/schema";const o=`
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
`;function r(){return process.env.SQLITE_PATH?process.env.SQLITE_PATH:process.env.VERCEL?"/tmp/copydesk.db":E.join(process.cwd(),"data","desk.db")}function i(){return!!process.env.VERCEL||process.env.DESK_DB==="sqljs"}function L(e=r()){e!==":memory:"&&t.mkdirSync(E.dirname(e),{recursive:!0});const s=new O(e);return s.pragma("journal_mode = WAL"),s.pragma("foreign_keys = ON"),s.exec(o),X(s,{schema:n})}const T=globalThis;async function m(e=r()){const s=(await import("sql.js")).default,d=c(import.meta.url).resolve("sql.js/dist/sql-wasm.wasm"),N=await s({wasmBinary:t.readFileSync(d)});let a;return e!==":memory:"&&t.existsSync(e)&&t.statSync(e).size>0?a=new N.Database(t.readFileSync(e)):(e!==":memory:"&&t.mkdirSync(E.dirname(e),{recursive:!0}),a=new N.Database),a.exec(o),T.sqlJsRaw=a,u(a,{schema:n})}function b(){const e=r();!i()||!T.sqlJsRaw||e===":memory:"||t.writeFileSync(e,Buffer.from(T.sqlJsRaw.export()))}async function D(){const e=r();return T.deskDb&&T.deskDbPath===e||(T.deskDb=i()?await m(e):L(e),T.deskDbPath=e),T.deskDb}function f(){const e=r();if(!T.deskDb||T.deskDbPath!==e){if(i())throw new Error("Database not initialized. Call initDb() / ensureSeeded() first.");T.deskDb=L(e),T.deskDbPath=e}return T.deskDb}function A(){T.deskDb=void 0,T.deskDbPath=void 0,T.sqlJsRaw=void 0}export{f as getDb,D as initDb,b as persistDb,A as resetDbSingleton,r as sqlitePath,i as useSqlJs};
