import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function requireApiAdmin() {
  const user = await getChatGPTUser();
  if (!user) throw new ApiError("Oturum açmanız gerekiyor.", 401);
  return user;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new ApiError("Geçersiz istek kaynağı.", 403);
}

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function apiFailure(error: unknown) {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error instanceof ApiError ? error.message : "İşlem tamamlanamadı.";
  if (!(error instanceof ApiError)) console.error(error);
  return Response.json({ error: message }, { status });
}

export function safeFilename(value: string) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "download";
}
