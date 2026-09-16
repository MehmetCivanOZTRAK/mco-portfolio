import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { ApiError, apiFailure, assertSameOrigin, requireApiAdmin } from "@/lib/security";

const idSchema = z.coerce.number().int().positive();
const editSchema = z.object({
  title: z.string().trim().min(2).max(80), slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(["game", "app"]), summary: z.string().trim().min(10).max(220), description: z.string().trim().max(6000), status: z.enum(["draft", "published"]),
  projectUrl: z.string().trim().max(300).refine((value) => { if (!value) return true; try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } }, "Geçersiz bağlantı."),
});

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin(); assertSameOrigin(request);
    const id = idSchema.parse((await context.params).id); const data = editSchema.parse(await request.json());
    const [project] = await getDb().update(projects).set({ ...data, projectUrl: data.projectUrl || null, updatedAt: new Date().toISOString() }).where(eq(projects.id, id)).returning();
    if (!project) throw new ApiError("Proje bulunamadı.", 404);
    return Response.json({ project });
  } catch (error) { return apiFailure(error); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin(); assertSameOrigin(request);
    const id = idSchema.parse((await context.params).id);
    const body = z.object({ status: z.enum(["draft", "published"]) }).parse(await request.json());
    const [project] = await getDb().update(projects).set({ status: body.status, updatedAt: new Date().toISOString() }).where(eq(projects.id, id)).returning();
    if (!project) throw new ApiError("Proje bulunamadı.", 404);
    return Response.json({ project });
  } catch (error) { return apiFailure(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin(); assertSameOrigin(request);
    const id = idSchema.parse((await context.params).id);
    const [project] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!project) throw new ApiError("Proje bulunamadı.", 404);
    await getDb().delete(projects).where(eq(projects.id, id));
    if (env.BUCKET) await Promise.all([project.coverKey, project.fileKey].filter(Boolean).map((key) => env.BUCKET!.delete(key!).catch(() => undefined)));
    return Response.json({ deleted: true });
  } catch (error) { return apiFailure(error); }
}
