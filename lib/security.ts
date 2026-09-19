import { verifyAdminSession, ADMIN_COOKIE } from "@/lib/admin-auth";
import { ZodError } from "zod";

export async function requireApiAdmin(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  if (!(await verifyAdminSession(cookie))) throw new ApiError("Oturum açmanız gerekiyor.", 401);
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new ApiError("Geçersiz istek kaynağı.", 403);
}

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function apiFailure(error: unknown) {
  const isDuplicateSlug = error instanceof Error && /UNIQUE constraint failed: projects\.slug/i.test(error.message);
  const status = error instanceof ApiError ? error.status : error instanceof ZodError ? 400 : isDuplicateSlug ? 409 : 500;
  const message = error instanceof ApiError ? error.message : error instanceof ZodError ? (error.issues[0]?.message ?? "Form bilgileri geçersiz.") : isDuplicateSlug ? "Bu URL kısa adı başka bir projede kullanılıyor." : "İşlem tamamlanamadı.";
  if (!(error instanceof ApiError) && !(error instanceof ZodError) && !isDuplicateSlug) console.error(error);
  return Response.json({ error: message }, { status });
}

export function safeFilename(value: string) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "download";
}
