import { env } from "cloudflare:workers";

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  if (!env.BUCKET) return new Response("Dosya deposu kullanılamıyor.", { status: 503 });
  const { key: parts } = await context.params;
  const key = parts.join("/");
  const object = await env.BUCKET.get(key);
  if (!object) return new Response("Dosya bulunamadı.", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  if (headers.get("content-type") === "application/pdf") {
    const originalName = object.customMetadata?.originalName ?? "document.pdf";
    headers.set("content-disposition", `inline; filename*=UTF-8''${encodeURIComponent(originalName)}`);
  } else if (key.startsWith("games/")) {
    const originalName = object.customMetadata?.originalName ?? "game.zip";
    headers.set("content-disposition", `attachment; filename*=UTF-8''${encodeURIComponent(originalName)}`);
  }
  return new Response(object.body, { headers });
}
