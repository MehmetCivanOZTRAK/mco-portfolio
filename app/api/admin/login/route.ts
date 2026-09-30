import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { password?: string };
    if (!(await verifyAdminPassword(body.password ?? ""))) {
      return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Giriş yapılamadı." }, { status: 500 });
  }
}
