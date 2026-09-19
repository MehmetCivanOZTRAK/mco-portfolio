import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { adminLoginAttempts } from "@/db/schema";
import { createAdminSession, sessionCookie, verifyAdminCredentials } from "@/lib/admin-auth";
import { ApiError, apiFailure, assertSameOrigin } from "@/lib/security";

const schema = z.object({ email: z.string().trim().email().max(160), password: z.string().min(10).max(200) });

async function requestKey(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = schema.parse(await request.json());
    const key = await requestKey(request); const now = Date.now(); const db = getDb();
    const [attempt] = await db.select().from(adminLoginAttempts).where(eq(adminLoginAttempts.identifier, key)).limit(1);
    if (attempt?.blockedUntil && Date.parse(attempt.blockedUntil) > now) throw new ApiError("Çok fazla deneme yapıldı. 15 dakika sonra tekrar deneyin.", 429);
    if (!(await verifyAdminCredentials(body.email, body.password))) {
      const failures = (attempt?.failures ?? 0) + 1; const blockedUntil = failures >= 5 ? new Date(now + 15 * 60_000).toISOString() : null;
      await db.insert(adminLoginAttempts).values({ identifier: key, failures, blockedUntil, updatedAt: new Date(now).toISOString() }).onConflictDoUpdate({ target: adminLoginAttempts.identifier, set: { failures, blockedUntil, updatedAt: new Date(now).toISOString() } });
      throw new ApiError("E-posta veya şifre hatalı.", 401);
    }
    await db.delete(adminLoginAttempts).where(eq(adminLoginAttempts.identifier, key));
    return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(await createAdminSession(), new URL(request.url).protocol === "https:") } });
  } catch (error) { return apiFailure(error); }
}
