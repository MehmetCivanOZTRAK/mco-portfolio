import Link from "next/link";
import { ArrowRight, Gamepad2, Sparkles } from "lucide-react";
import { GameCatalog } from "@/components/game-catalog";
import { getProfile, getPublishedProjects, getSiteContent } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [profile, projects, content] = await Promise.all([getProfile(), getPublishedProjects(), getSiteContent()]);
  const featured = projects.find((project) => project.featured) ?? projects.find((project) => project.kind === "game") ?? projects[0];
  const brand = content.brandLabel.replace("{name}", profile.displayName.toUpperCase());
  const copyright = content.copyrightText.replace("{year}", String(new Date().getFullYear())).replace("{name}", profile.displayName.toUpperCase());
  return <main className="arcade-home">
    <header className="arcade-header" id="top"><Link className="brand" href="/" aria-label="Ana sayfa"><span className="brand-mark"><Gamepad2 size={20} /></span><span>{brand}</span></Link><nav aria-label="Ana menü"><a href="#oyunlar">{content.navProjects}</a><a href="#hakkimda">{content.navAbout}</a><a className="nav-cta" href="/login?return_to=/admin">{content.navAdmin}</a></nav></header>
    <section className="arcade-hero">{featured ? <><div className="featured-copy"><p className="eyebrow"><Sparkles size={14} /> {content.featuredEyebrow}</p><span className="featured-category">{featured.category}</span><h1>{featured.title}</h1><p>{featured.summary}</p><Link className="primary-action" href={featured.kind === "game" ? `/games/${featured.slug}` : `/projects/${featured.slug}`}>{content.heroCta}<ArrowRight size={18} /></Link></div><Link aria-label={`${featured.title} sayfasını aç`} className={`featured-art ${featured.coverKey ? "has-cover" : ""}`} href={featured.kind === "game" ? `/games/${featured.slug}` : `/projects/${featured.slug}`} style={featured.coverKey ? { backgroundImage: `linear-gradient(180deg,transparent 45%,rgb(7 9 13 / 80%)),url(/assets/${featured.slug}/cover)` } : undefined}><span>{content.visualBadge}</span><strong>{featured.title}</strong></Link></> : <div className="featured-copy featured-empty"><p className="eyebrow">{content.visualBadge}</p><h1>{content.heroLine1}<br />{content.heroLine2}</h1><p>{profile.about}</p><a className="primary-action" href="/login?return_to=/admin">{content.heroCta} <ArrowRight size={18} /></a></div>}
    </section>
    <section className="catalog-section" id="oyunlar"><div className="catalog-heading"><div><p className="eyebrow">{content.projectsEyebrow}</p><h2>{content.projectsTitle}</h2></div><p>{projects.length ? content.projectsDescription : content.projectsEmptyDescription}</p></div><GameCatalog labels={{ search: content.searchPlaceholder, emptyTitle: content.emptyTitle, emptyText: content.emptyText, play: content.playLabel, view: content.projectLinkLabel }} projects={projects.map((project) => ({ id: project.id, slug: project.slug, title: project.title, kind: project.kind, summary: project.summary, category: project.category, coverKey: project.coverKey, gameRootKey: project.gameRootKey, featured: project.featured }))} /></section>
    <footer id="hakkimda"><div className="footer-kicker">{content.footerEyebrow}</div><div className="footer-main"><h2>{profile.headline}</h2><p>{profile.about}{profile.email ? <><br /><br /><a href={`mailto:${profile.email}`}>{profile.email}</a></> : null}</p></div><div className="footer-bottom"><span>{copyright}</span><a href="#top">{content.footerBackLabel}</a></div></footer>
  </main>;
}
