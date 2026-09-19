import { env } from "cloudflare:workers";
import { z } from "zod";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { ApiError, apiFailure, assertSameOrigin, requireApiAdmin, safeFilename } from "@/lib/security";
import { getAllProjects } from "@/lib/portfolio";
import { unpackWebGame } from "@/lib/game-package";

const schema = z.object({
  title: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(["game", "app"]),
  summary: z.string().trim().min(10).max(220),
  description: z.string().trim().max(6000).default(""),
  status: z.enum(["draft", "published"]),
  projectUrl: z.string().trim().max(300).optional().refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Geçersiz bağlantı."),
  category: z.string().trim().min(2).max(40),
});
const coverTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const packageExt = new Set(["zip", "apk", "exe", "msi", "dmg", "appimage"]);

export async function GET(request: Request) {
  try { await requireApiAdmin(request); return Response.json({ projects: await getAllProjects() }); }
  catch (error) { return apiFailure(error); }
}

export async function POST(request: Request) {
  const uploaded: string[] = [];
  try {
    await requireApiAdmin(request); assertSameOrigin(request);
    const data = await request.formData();
    const parsed = schema.safeParse(Object.fromEntries(["title", "slug", "kind", "summary", "description", "status", "projectUrl", "category"].map((key) => [key, String(data.get(key) ?? "")])));
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Form bilgileri geçersiz.");
    const cover = data.get("cover"); const projectFile = data.get("projectFile"); const webGame = data.get("webGame");
    if (cover instanceof File && cover.size) {
      if (!coverTypes.has(cover.type) || cover.size > 5 * 1024 * 1024) throw new ApiError("Kapak JPG, PNG veya WebP olmalı ve 5 MB'ı geçmemeli.");
    }
    if (projectFile instanceof File && projectFile.size) {
      const ext = projectFile.name.split(".").pop()?.toLowerCase() ?? "";
      if (!packageExt.has(ext) || projectFile.size > 20 * 1024 * 1024) throw new ApiError("Proje dosyası ZIP/APK/EXE/MSI/DMG/AppImage olmalı ve 20 MB'ı geçmemeli.");
    }
    if (webGame instanceof File && webGame.size) {
      if (parsed.data.kind !== "game" || !webGame.name.toLowerCase().endsWith(".zip") || webGame.size > 15 * 1024 * 1024) throw new ApiError("Tarayıcı oyunu, kökünde index.html bulunan ve en fazla 15 MB olan bir ZIP dosyası olmalı.");
    }
    let coverKey: string | null = null; let fileKey: string | null = null; let gameRootKey: string | null = null;
    if ((cover instanceof File && cover.size) || (projectFile instanceof File && projectFile.size) || (webGame instanceof File && webGame.size)) {
      if (!env.BUCKET) throw new ApiError("Dosya depolama şu anda kullanılamıyor.", 503);
      const bucket = env.BUCKET;
      if (cover instanceof File && cover.size) { coverKey = `covers/${crypto.randomUUID()}`; await bucket.put(coverKey, cover.stream(), { httpMetadata: { contentType: cover.type } }); uploaded.push(coverKey); }
      if (projectFile instanceof File && projectFile.size) { fileKey = `packages/${crypto.randomUUID()}-${safeFilename(projectFile.name)}`; await bucket.put(fileKey, projectFile.stream(), { httpMetadata: { contentType: "application/octet-stream", contentDisposition: `attachment; filename="${safeFilename(projectFile.name)}"` } }); uploaded.push(fileKey); }
      if (webGame instanceof File && webGame.size) {
        const assets = unpackWebGame(new Uint8Array(await webGame.arrayBuffer())); gameRootKey = `games/${crypto.randomUUID()}`;
        for (let index = 0; index < assets.length; index += 10) await Promise.all(assets.slice(index, index + 10).map(async (asset) => { const key = `${gameRootKey}/${asset.path}`; await bucket.put(key, asset.bytes, { httpMetadata: { contentType: asset.contentType } }); uploaded.push(key); }));
      }
    }
    const [project] = await getDb().insert(projects).values({ ...parsed.data, featured: data.get("featured") === "on", projectUrl: parsed.data.projectUrl || null, coverKey, fileKey, fileName: projectFile instanceof File && projectFile.size ? safeFilename(projectFile.name) : null, fileSize: projectFile instanceof File && projectFile.size ? projectFile.size : null, gameRootKey }).returning();
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    if (env.BUCKET) await Promise.all(uploaded.map((key) => env.BUCKET!.delete(key).catch(() => undefined)));
    return apiFailure(error);
  }
}
