import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { isSameOriginRequest, requireAdmin } from "@/lib/admin-auth";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BUCKET_BYTES = 8 * 1024 * 1024 * 1024;

async function getStoredBytes(bucket: R2Bucket) {
  let storedBytes = 0;
  let cursor: string | undefined;

  do {
    const result = await bucket.list({ cursor, limit: 1000 });
    storedBytes += result.objects.reduce((total, object) => total + object.size, 0);
    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);

  return storedBytes;
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 403 });
    }
    await requireAdmin();
    const bucket = env.BUCKET;
    if (!bucket) throw new Error("Dosya deposu kullanılamıyor.");

    const data = await request.formData();
    const file = data.get("file");
    const requestedCategory = data.get("category");
    const category = requestedCategory === "document" ? "documents" : requestedCategory === "game" ? "games" : "images";
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Bir dosya seçin." }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf";
    const isImage = imageTypes.has(file.type);
    const isZip = file.type === "application/zip" || file.type === "application/x-zip-compressed" || file.name.toLowerCase().endsWith(".zip");
    if ((category === "documents" && !isPdf) || (category === "images" && !isImage) || (category === "games" && !isZip)) {
      const error = category === "documents" ? "Yalnızca PDF yüklenebilir." : category === "games" ? "Oyun paketi ZIP biçiminde olmalıdır." : "JPG, PNG, WEBP veya GIF yüklenebilir.";
      return NextResponse.json({ error }, { status: 400 });
    }

    const maxMegabytes = category === "games" ? 95 : category === "documents" ? 15 : 8;
    const maxBytes = maxMegabytes * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `Dosya en fazla ${maxMegabytes} MB olabilir.` }, { status: 400 });
    }

    const storedBytes = await getStoredBytes(bucket);
    if (storedBytes + file.size > MAX_BUCKET_BYTES) {
      return NextResponse.json({
        error: "Ücretsiz R2 kotasını korumak için toplam yükleme alanı 8 GB ile sınırlandırıldı.",
      }, { status: 413 });
    }

    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
    const key = `${category}/${crypto.randomUUID()}-${safeName || (isPdf ? "document.pdf" : isZip ? "game.zip" : "image")}`;
    await bucket.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { originalName: file.name },
    });

    const url = `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
    return NextResponse.json({ key, url, fileName: file.name, mimeType: file.type });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dosya yüklenemedi." }, { status: 500 });
  }
}
