import { env } from "cloudflare:workers";
import { getProjectBySlug } from "@/lib/portfolio";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const project = await getProjectBySlug((await context.params).slug);
  if (!project?.coverKey || !env.BUCKET) return new Response("Not found", { status: 404 });
  const object = await env.BUCKET.get(project.coverKey);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("cache-control", "public, max-age=3600"); headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
