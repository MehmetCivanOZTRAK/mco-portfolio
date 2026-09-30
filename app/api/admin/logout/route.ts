import { NextResponse } from "next/server";
import { clearAdminSession, isSameOriginRequest } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 403 });
  }
  await clearAdminSession();
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
