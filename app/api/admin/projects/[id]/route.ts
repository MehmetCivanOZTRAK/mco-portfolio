import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { ApiError, apiFailure, assertSameOrigin, requireApiAdmin } from "@/lib/security";
import { safeFilename } from "@/lib/security";
import { unpackWebGame, WEB_GAME_ZIP_LIMIT } from "@/lib/game-package";

const idSchema = z.coerce.number().int().positive();
const editSchema = z.object({
  title: z.string().trim().min(2).max(80), slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(["game", "app"]), category: z.string().trim().min(2).max(40), summary: z.string().trim().min(10).max(220), description: z.string().trim().max(6000), status: z.enum(["draft", "published"]),
  projectUrl: z.string().trim().max(300).refine((value) => { if (!value) return true; try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } }, "Geçersiz bağlantı."),
});

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const uploaded: string[] = [];
  try {
    await requireApiAdmin(request); assertSameOrigin(request);
    const id = idSchema.parse((await context.params).id); const form = await request.formData();
    const data = editSchema.parse(Object.fromEntries(["title", "slug", "kind", "category", "summary", "description", "status", "projectUrl"].map((key) => [key, String(form.get(key) ?? "")])));
    const [current] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!current) throw new ApiError("Proje bulunamadı.", 404);
    const cover = form.get("cover"); const projectFile = form.get("projectFile"); const webGame = form.get("webGame");
    if (cover instanceof File && cover.size && (!["image/jpeg", "image/png", "image/webp"].includes(cover.type) || cover.size > 5 * 1024 * 1024)) throw new ApiError("Kapak JPG, PNG veya WebP olmalı ve 5 MB'ı geçmemeli.");
    if (projectFile instanceof File && projectFile.size) { const extension = projectFile.name.split(".").pop()?.toLowerCase() ?? ""; if (!["zip", "apk", "exe", "msi", "dmg", "appimage"].includes(extension) || projectFile.size > 20 * 1024 * 1024) throw new ApiError("Proje dosyası desteklenmiyor veya 20 MB sınırını aşıyor."); }
    if (webGame instanceof File && webGame.size && (data.kind !== "game" || !webGame.name.toLowerCase().endsWith(".zip") || webGame.size > WEB_GAME_ZIP_LIMIT)) throw new ApiError("Unity WebGL oyunu ZIP olmalı, yalnızca oyunlarda kullanılmalı ve 50 MB'ı geçmemeli.");
    let coverKey = current.coverKey; let fileKey = current.fileKey; let fileName = current.fileName; let fileSize = current.fileSize; let gameRootKey = current.gameRootKey;
    if ((cover instanceof File && cover.size) || (projectFile instanceof File && projectFile.size) || (webGame instanceof File && webGame.size)) {
      if (!env.BUCKET) throw new ApiError("Dosya depolama şu anda kullanılamıyor.", 503);
      const bucket = env.BUCKET;
      if (cover instanceof File && cover.size) { coverKey = `covers/${crypto.randomUUID()}`; await bucket.put(coverKey, cover.stream(), { httpMetadata: { contentType: cover.type } }); uploaded.push(coverKey); }
      if (projectFile instanceof File && projectFile.size) { fileName = safeFilename(projectFile.name); fileSize = projectFile.size; fileKey = `packages/${crypto.randomUUID()}-${fileName}`; await bucket.put(fileKey, projectFile.stream(), { httpMetadata: { contentType: "application/octet-stream", contentDisposition: `attachment; filename="${fileName}"` } }); uploaded.push(fileKey); }
      if (webGame instanceof File && webGame.size) { const assets = unpackWebGame(new Uint8Array(await webGame.arrayBuffer())); gameRootKey = `games/${crypto.randomUUID()}`; for (let index = 0; index < assets.length; index += 10) await Promise.all(assets.slice(index, index + 10).map(async (asset) => { const key = `${gameRootKey}/${asset.path}`; await bucket.put(key, asset.bytes, { httpMetadata: { contentType: asset.contentType, contentEncoding: asset.contentEncoding } }); uploaded.push(key); })); }
    }
    const [project] = await getDb().update(projects).set({ ...data, featured: form.get("featured") === "on", projectUrl: data.projectUrl || null, coverKey, fileKey, fileName, fileSize, gameRootKey, updatedAt: new Date().toISOString() }).where(eq(projects.id, id)).returning();
    if (!project) throw new ApiError("Proje bulunamadı.", 404);
    if (env.BUCKET) {
      if (coverKey !== current.coverKey && current.coverKey) await env.BUCKET.delete(current.coverKey).catch(() => undefined);
      if (fileKey !== current.fileKey && current.fileKey) await env.BUCKET.delete(current.fileKey).catch(() => undefined);
      if (gameRootKey !== current.gameRootKey && current.gameRootKey) { let cursor: string | undefined; do { const listed = await env.BUCKET.list({ prefix: `${current.gameRootKey}/`, cursor }); await Promise.all(listed.objects.map((object) => env.BUCKET!.delete(object.key))); cursor = listed.truncated ? listed.cursor : undefined; } while (cursor); }
    }
    return Response.json({ project });
  } catch (error) { if (env.BUCKET) await Promise.all(uploaded.map((key) => env.BUCKET!.delete(key).catch(() => undefined))); return apiFailure(error); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin(request); assertSameOrigin(request);
    const id = idSchema.parse((await context.params).id);
    const body = z.object({ status: z.enum(["draft", "published"]) }).parse(await request.json());
    const [project] = await getDb().update(projects).set({ status: body.status, updatedAt: new Date().toISOString() }).where(eq(projects.id, id)).returning();
    if (!project) throw new ApiError("Proje bulunamadı.", 404);
    return Response.json({ project });
  } catch (error) { return apiFailure(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin(request); assertSameOrigin(request);
    const id = idSchema.parse((await context.params).id);
    const [project] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!project) throw new ApiError("Proje bulunamadı.", 404);
    await getDb().delete(projects).where(eq(projects.id, id));
    if (env.BUCKET) {
      const directKeys = [project.coverKey, project.fileKey].filter(Boolean) as string[];
      if (project.gameRootKey) {
        let cursor: string | undefined;
        do { const listed = await env.BUCKET.list({ prefix: `${project.gameRootKey}/`, cursor }); await Promise.all(listed.objects.map((object) => env.BUCKET!.delete(object.key))); cursor = listed.truncated ? listed.cursor : undefined; } while (cursor);
      }
      await Promise.all(directKeys.map((key) => env.BUCKET!.delete(key).catch(() => undefined)));
    }
    return Response.json({ deleted: true });
  } catch (error) { return apiFailure(error); }
}
