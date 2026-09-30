export type LatestVideo = {
  title: string;
  url: string;
  thumbnailUrl: string;
};

type CachedVideos = {
  expiresAt: number;
  videos: LatestVideo[];
};

const CACHE_DURATION_MS = 30 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 2500;
const videoCache = new Map<string, CachedVideos>();

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export async function getLatestYouTubeVideos(channelId: string, limit = 2): Promise<LatestVideo[]> {
  const normalizedChannelId = channelId.trim();
  if (!/^UC[\w-]{20,}$/.test(normalizedChannelId) || limit < 1) return [];

  const cached = videoCache.get(normalizedChannelId);
  if (cached && cached.expiresAt > Date.now()) return cached.videos.slice(0, limit);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(normalizedChannelId)}`,
      { next: { revalidate: 1800 }, signal: controller.signal },
    );
    if (!response.ok) return cached?.videos.slice(0, limit) ?? [];

    const xml = await response.text();
    const videos = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g))
      .slice(0, limit)
      .flatMap((match) => {
        const entry = match[1];
        const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
        const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
        if (!videoId || !title) return [];

        return [{
          title: decodeXml(title.trim()),
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        }];
      });

    videoCache.set(normalizedChannelId, {
      expiresAt: Date.now() + CACHE_DURATION_MS,
      videos,
    });
    return videos;
  } catch (error) {
    console.warn("Latest YouTube video could not be loaded:", error);
    return cached?.videos.slice(0, limit) ?? [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLatestYouTubeVideo(channelId: string): Promise<LatestVideo | null> {
  return (await getLatestYouTubeVideos(channelId, 1))[0] ?? null;
}
