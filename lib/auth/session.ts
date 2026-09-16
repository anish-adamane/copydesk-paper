import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/db/seed";

const COOKIE = "copydesk_session";

function secret() {
  const raw = process.env.SESSION_SECRET ?? "copydesk-local-demo-not-for-prod";
  return new TextEncoder().encode(raw);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "Hiring manager",
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await readSession();
  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "UnauthorizedError";
    throw error;
  }
  return user;
}

export async function loginWithPassword(email: string, password: string) {
  await ensureSeeded();
  const db = getDb();
  const row = db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).get();
  if (!row) return null;
  const ok = bcrypt.compareSync(password, row.passwordHash);
  if (!ok) return null;
  const user = { id: row.id, email: row.email, name: row.name };
  await createSession(user);
  return user;
}
