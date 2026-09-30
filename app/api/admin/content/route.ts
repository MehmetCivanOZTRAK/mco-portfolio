import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isSameOriginRequest, requireAdmin } from "@/lib/admin-auth";
import { portfolioContentSchema } from "@/lib/content";
import { readPortfolioContent, writePortfolioContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await readPortfolioContent());
  } catch {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 403 });
    }
    await requireAdmin();
    const payload = portfolioContentSchema.parse(await request.json());
    return NextResponse.json(await writePortfolioContent(payload));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Bazı alanlar geçersiz.", details: error.issues }, { status: 400 });
    }
    console.error("Portfolio content could not be saved:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "İçerik kaydedilemedi. Veritabanı bağlantısını kontrol edin." },
      { status: 500 },
    );
  }
}
