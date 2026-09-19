import { unzipSync } from "fflate";
import { ApiError } from "@/lib/security";

export const WEB_GAME_ZIP_LIMIT = 50 * 1024 * 1024;
export const WEB_GAME_EXPANDED_LIMIT = 250 * 1024 * 1024;
export const WEB_GAME_FILE_LIMIT = 1_000;

const allowedExtensions = new Set(["html", "htm", "js", "mjs", "css", "json", "png", "jpg", "jpeg", "webp", "gif", "svg", "ico", "mp3", "ogg", "wav", "m4a", "woff", "woff2", "ttf", "wasm", "data", "bin", "txt", "xml", "map", "unityweb"]);
const mimeTypes: Record<string, string> = { html: "text/html; charset=utf-8", htm: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8", mjs: "text/javascript; charset=utf-8", css: "text/css; charset=utf-8", json: "application/json; charset=utf-8", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", ico: "image/x-icon", mp3: "audio/mpeg", ogg: "audio/ogg", wav: "audio/wav", m4a: "audio/mp4", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", wasm: "application/wasm", data: "application/octet-stream", bin: "application/octet-stream", unityweb: "application/octet-stream", xml: "application/xml", txt: "text/plain; charset=utf-8", map: "application/json; charset=utf-8" };

export type GameAsset = { path: string; bytes: Uint8Array; contentType: string; contentEncoding?: "gzip" | "br" };

function assetMetadata(path: string) {
  const parts = path.toLowerCase().split(".");
  const compression = parts.at(-1);
  const contentEncoding = compression === "gz" ? "gzip" : compression === "br" ? "br" : undefined;
  const extension = contentEncoding ? parts.at(-2) ?? "" : compression ?? "";
  if (!allowedExtensions.has(extension)) throw new ApiError(`Oyun paketindeki .${extension || "?"} dosya türüne izin verilmiyor.`);
  return { contentType: mimeTypes[extension] ?? "application/octet-stream", contentEncoding } as const;
}

export function unpackWebGame(bytes: Uint8Array): GameAsset[] {
  let archive: Record<string, Uint8Array>;
  try { archive = unzipSync(bytes); } catch { throw new ApiError("Oyun ZIP dosyası açılamadı veya bozuk."); }

  const files: { path: string; bytes: Uint8Array }[] = []; let totalSize = 0;
  for (const [rawPath, fileBytes] of Object.entries(archive)) {
    const path = rawPath.replace(/\\/g, "/").replace(/^\.\//, "");
    if (!path || path.endsWith("/") || path.startsWith("__MACOSX/") || path.endsWith("/.DS_Store") || path === ".DS_Store") continue;
    if (path.startsWith("/") || path.split("/").some((segment) => segment === ".." || segment === "")) throw new ApiError("Oyun paketinde güvenli olmayan bir dosya yolu var.");
    totalSize += fileBytes.byteLength;
    if (files.length >= WEB_GAME_FILE_LIMIT || totalSize > WEB_GAME_EXPANDED_LIMIT) throw new ApiError("Oyun paketi en fazla 1.000 dosya ve açılmış halde 250 MB olabilir.");
    files.push({ path, bytes: fileBytes });
  }

  const rootIndex = files.find((file) => file.path.toLowerCase() === "index.html");
  let prefix = "";
  if (!rootIndex) {
    const nestedIndexes = files.filter((file) => file.path.toLowerCase().endsWith("/index.html"));
    if (nestedIndexes.length !== 1) throw new ApiError("Unity WebGL ZIP paketinde index.html bulunamadı. Build klasörünü ZIP olarak yükleyin.");
    prefix = nestedIndexes[0].path.slice(0, -"index.html".length);
    if (!files.every((file) => file.path.startsWith(prefix))) throw new ApiError("ZIP içinde index.html ile ilgisiz birden fazla kök klasör var.");
  }

  const seen = new Set<string>();
  return files.map((file) => {
    const path = prefix ? file.path.slice(prefix.length) : file.path;
    const normalized = path.toLowerCase();
    if (!path || seen.has(normalized)) throw new ApiError("Oyun paketinde yinelenen bir dosya yolu var.");
    seen.add(normalized);
    return { path, bytes: file.bytes, ...assetMetadata(path) };
  });
}

export function gameAssetMetadata(path: string) {
  return assetMetadata(path);
}
