import { env } from "cloudflare:workers";
import { getProjectBySlug } from "@/lib/portfolio";
import { gameAssetMetadata } from "@/lib/game-package";

export async function GET(_request: Request, context: { params: Promise<{ slug: string; path: string[] }> }) {
  const { slug, path } = await context.params;
  if (!Array.isArray(path) || !path.length || path.some((segment) => !segment || segment === ".." || segment.includes("\\"))) return new Response("Not found", { status: 404 });
  const project = await getProjectBySlug(slug);
  if (!project || project.kind !== "game" || !project.gameRootKey || !env.BUCKET) return new Response("Not found", { status: 404 });
  const assetPath = path.join("/"); const object = await env.BUCKET.get(`${project.gameRootKey}/${assetPath}`);
  if (!object) return new Response("Not found", { status: 404 });
  const fallback = gameAssetMetadata(assetPath);
  const contentType = object.httpMetadata?.contentType ?? fallback.contentType;
  const contentEncoding = object.httpMetadata?.contentEncoding || fallback.contentEncoding;
  const headers = new Headers({ "Content-Type": contentType, "X-Content-Type-Options": "nosniff", "Access-Control-Allow-Origin": "*", "Cross-Origin-Resource-Policy": "cross-origin", "Cache-Control": contentType.startsWith("text/html") ? "no-cache" : "public, max-age=31536000, immutable" });
  if (contentEncoding) headers.set("Content-Encoding", contentEncoding);
  if (contentType.startsWith("text/html")) headers.set("Content-Security-Policy", "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https: wss:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  return new Response(object.body, { headers });
}
