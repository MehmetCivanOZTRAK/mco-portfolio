import { env } from "cloudflare:workers";
import { getProjectBySlug } from "@/lib/portfolio";
import { safeFilename } from "@/lib/security";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const project = await getProjectBySlug((await context.params).slug);
  if (!project?.fileKey || !project.fileName || !env.BUCKET) return new Response("Not found", { status: 404 });
  const object = await env.BUCKET.get(project.fileKey);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers({ "content-type": "application/octet-stream", "content-disposition": `attachment; filename="${safeFilename(project.fileName)}"`, "x-content-type-options": "nosniff", "cache-control": "private, no-store" });
  return new Response(object.body, { headers });
}
