import { env } from "cloudflare:workers";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;
const BLOCK_SECONDS = 15 * 60;

type AttemptRow = {
  attempts: number;
  blocked_until: number;
  updated_at: number;
};

let tableReady: Promise<unknown> | undefined;

function database() {
  if (!env.DB) throw new Error("Giriş güvenliği veritabanına ulaşılamıyor.");
  tableReady ??= env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_login_attempts (
      identifier TEXT PRIMARY KEY NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      blocked_until INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    )
  `).run().catch((error) => {
    tableReady = undefined;
    throw error;
  });
  return env.DB;
}

async function ensureTable() {
  database();
  await tableReady;
}

async function requestIdentifier(request: Request) {
  const address = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const bytes = new TextEncoder().encode(`admin-login:${address}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function readAttempt(identifier: string) {
  await ensureTable();
  return database()
    .prepare("SELECT attempts, blocked_until, updated_at FROM admin_login_attempts WHERE identifier = ?")
    .bind(identifier)
    .first<AttemptRow>();
}

export async function loginRateLimit(request: Request) {
  const identifier = await requestIdentifier(request);
  const row = await readAttempt(identifier);
  const now = Math.floor(Date.now() / 1000);
  return {
    identifier,
    blocked: Boolean(row && row.blocked_until > now),
    retryAfter: row ? Math.max(0, row.blocked_until - now) : 0,
  };
}

export async function recordLoginFailure(identifier: string) {
  const row = await readAttempt(identifier);
  const now = Math.floor(Date.now() / 1000);
  const attempts = row && row.updated_at >= now - WINDOW_SECONDS ? row.attempts + 1 : 1;
  const blockedUntil = attempts >= MAX_ATTEMPTS ? now + BLOCK_SECONDS : 0;

  await database().prepare(`
    INSERT INTO admin_login_attempts (identifier, attempts, blocked_until, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(identifier) DO UPDATE SET
      attempts = excluded.attempts,
      blocked_until = excluded.blocked_until,
      updated_at = excluded.updated_at
  `).bind(identifier, attempts, blockedUntil, now).run();

  return { blocked: blockedUntil > now, retryAfter: Math.max(0, blockedUntil - now) };
}

export async function clearLoginFailures(identifier: string) {
  await ensureTable();
  await database().prepare("DELETE FROM admin_login_attempts WHERE identifier = ?").bind(identifier).run();
}
