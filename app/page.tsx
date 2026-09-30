import { readPortfolioContent } from "@/lib/content-store";
import { PortfolioClient } from "@/components/portfolio-client";
import { getLatestYouTubeVideo } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await readPortfolioContent();
  const latestVideo = await getLatestYouTubeVideo(content.creator.youtubeChannelId);
  return <PortfolioClient content={content} latestVideo={latestVideo} />;
}
