import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { ApiError, apiFailure, assertSameOrigin, requireApiAdmin } from "@/lib/security";

const idSchema = z.coerce.number().int().positive();

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
