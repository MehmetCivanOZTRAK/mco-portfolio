import { NextResponse } from "next/server";
import { createAdminSession, isSameOriginRequest, verifyAdminPassword } from "@/lib/admin-auth";
import { clearLoginFailures, loginRateLimit, recordLoginFailure } from "@/lib/admin-rate-limit";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 403 });
    }

    const rateLimit = await loginRateLimit(request);
    if (rateLimit.blocked) {
      return NextResponse.json(
        { error: "Çok fazla hatalı deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter), "Cache-Control": "no-store" } },
      );
    }

    const body = await request.json() as { password?: string };
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (!(await verifyAdminPassword(password))) {
      const failure = await recordLoginFailure(rateLimit.identifier);
      return NextResponse.json(
        { error: failure.blocked ? "Çok fazla hatalı deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin." : "Şifre hatalı." },
        { status: failure.blocked ? 429 : 401, headers: { "Retry-After": String(failure.retryAfter), "Cache-Control": "no-store" } },
      );
    }

    await clearLoginFailures(rateLimit.identifier);
    await createAdminSession();
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin login failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Giriş yapılamadı." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
