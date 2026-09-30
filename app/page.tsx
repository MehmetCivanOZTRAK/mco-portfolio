import { readPortfolioContent } from "@/lib/content-store";
import { PortfolioClient } from "@/components/portfolio-client";
import { getLatestYouTubeVideos } from "@/lib/youtube";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await readPortfolioContent();
  const latestVideos = await getLatestYouTubeVideos(content.creator.youtubeChannelId, 2);
  const sameAs = Object.values(content.socials).filter((url) => /^https?:\/\//.test(url));
  const photoUrl = content.profile.photoUrl ? new URL(content.profile.photoUrl, SITE_URL).toString() : undefined;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    mainEntity: {
      "@type": "Person",
      "@id": `${SITE_URL}/#mehmet-civan-oztrak`,
      name: content.profile.name,
      alternateName: ["Mehmet Civan Oztrak", "MCO"],
      url: SITE_URL,
      jobTitle: ["Oyun Geliştirici", "Game Developer", "Bilgisayar Mühendisliği Öğrencisi"],
      description: content.profile.description.tr,
      email: content.profile.email || undefined,
      image: photoUrl,
      sameAs,
      knowsAbout: ["Game Development", "Unity", "Software Development", "Computer Engineering", "Digital Content Creation"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <PortfolioClient content={content} latestVideos={latestVideos} />
    </>
  );
}
