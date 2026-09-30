export type LatestVideo = {
  title: string;
  url: string;
  thumbnailUrl: string;
};

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export async function getLatestYouTubeVideo(channelId: string): Promise<LatestVideo | null> {
  if (!/^UC[\w-]{20,}$/.test(channelId.trim())) return null;

  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId.trim())}`,
      { next: { revalidate: 1800 } },
    );
    if (!response.ok) return null;

    const xml = await response.text();
    const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
    const videoId = entry?.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry?.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    if (!videoId || !title) return null;

    return {
      title: decodeXml(title.trim()),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch (error) {
    console.warn("Latest YouTube video could not be loaded:", error);
    return null;
  }
}
