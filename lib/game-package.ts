import { unzipSync } from "fflate";
import { ApiError } from "@/lib/security";

const allowedExtensions = new Set(["html", "htm", "js", "mjs", "css", "json", "png", "jpg", "jpeg", "webp", "gif", "svg", "ico", "mp3", "ogg", "wav", "m4a", "woff", "woff2", "ttf", "wasm", "data", "bin", "txt", "xml", "map"]);
const mimeTypes: Record<string, string> = { html: "text/html; charset=utf-8", htm: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8", mjs: "text/javascript; charset=utf-8", css: "text/css; charset=utf-8", json: "application/json; charset=utf-8", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", ico: "image/x-icon", mp3: "audio/mpeg", ogg: "audio/ogg", wav: "audio/wav", m4a: "audio/mp4", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", wasm: "application/wasm", xml: "application/xml", txt: "text/plain; charset=utf-8", map: "application/json; charset=utf-8" };

export type GameAsset = { path: string; bytes: Uint8Array; contentType: string };

export function unpackWebGame(bytes: Uint8Array): GameAsset[] {
  let archive: Record<string, Uint8Array>;
  try { archive = unzipSync(bytes); } catch { throw new ApiError("Oyun ZIP dosyası açılamadı veya bozuk."); }
  const assets: GameAsset[] = []; let totalSize = 0;
  for (const [rawPath, fileBytes] of Object.entries(archive)) {
    const path = rawPath.replace(/\\/g, "/").replace(/^\.\//, "");
    if (!path || path.endsWith("/")) continue;
    if (path.startsWith("/") || path.split("/").some((segment) => segment === ".." || segment === "")) throw new ApiError("Oyun paketinde güvenli olmayan bir dosya yolu var.");
    const extension = path.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.has(extension)) throw new ApiError(`Oyun paketindeki .${extension || "?"} dosya türüne izin verilmiyor.`);
    totalSize += fileBytes.byteLength;
    if (assets.length >= 300 || totalSize > 60 * 1024 * 1024) throw new ApiError("Oyun paketi en fazla 300 dosya ve açılmış halde 60 MB olabilir.");
    assets.push({ path, bytes: fileBytes, contentType: mimeTypes[extension] ?? "application/octet-stream" });
  }
  if (!assets.some((asset) => asset.path.toLowerCase() === "index.html")) throw new ApiError("Oyun paketinin kök dizininde index.html bulunmalı.");
  return assets;
}

export function gameAssetContentType(path: string) {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  return mimeTypes[extension] ?? "application/octet-stream";
}
