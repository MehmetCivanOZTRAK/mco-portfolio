import { NextResponse } from "next/server";
import { getLatestYouTubeVideos } from "@/lib/youtube";

export async function GET(request: Request) {
  const channelId = new URL(request.url).searchParams.get("channelId")?.trim() ?? "";
  if (!/^UC[\w-]{20,}$/.test(channelId)) {
    return NextResponse.json({ error: "Geçersiz YouTube kanal kimliği." }, { status: 400 });
  }

  const videos = await getLatestYouTubeVideos(channelId, 2);
  return NextResponse.json(videos, {
    headers: {
      "Cache-Control": "public, max-age=900, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
