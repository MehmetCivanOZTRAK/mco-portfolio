import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Gamepad2, Shapes } from "lucide-react";
import { getProfile, getPublishedProjects, getSiteContent } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [profile, projects, content] = await Promise.all([getProfile(), getPublishedProjects(), getSiteContent()]);
  const brand = content.brandLabel.replace("{name}", profile.displayName.toUpperCase());
  const copyright = content.copyrightText.replace("{year}", String(new Date().getFullYear())).replace("{name}", profile.displayName.toUpperCase());
  return <main>
    <header className="site-header"><Link className="brand" href="#top" aria-label="Ana sayfa"><span className="brand-mark"><Gamepad2 size={20} /></span><span>{brand}</span></Link><nav aria-label="Ana menü"><a href="#projeler">{content.navProjects}</a><a href="#hakkimda">{content.navAbout}</a><a className="nav-cta" href="/admin" target="_top">{content.navAdmin}</a></nav></header>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow"><span /> {profile.role}</p><h1>{content.heroLine1}<br /><span>{content.heroLine2}</span><br />{content.heroLine3}</h1><p className="hero-text">{profile.about}</p><a className="primary-action" href="#projeler">{content.heroCta} <ArrowDownRight size={18} /></a></div><div className="hero-visual" aria-label="Oyun ve uygulama projeleri için soyut vitrin görseli"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="core-card"><Shapes size={38} /><span>{content.visualBadge}</span></div><p className="visual-index">{content.visualIndex}</p></div></section>
    <section className="projects" id="projeler"><div className="section-heading"><div><p className="eyebrow">{content.projectsEyebrow}</p><h2>{content.projectsTitle}</h2></div><p>{projects.length ? content.projectsDescription : content.projectsEmptyDescription}</p></div>
      {projects.length ? <div className="project-grid">{projects.map((project, index) => <Link className={`project-card ${index % 2 ? "violet" : "cyan"}`} href={`/projects/${project.slug}`} key={project.id}><div className={`project-art ${project.coverKey ? "has-cover" : ""}`} style={project.coverKey ? { backgroundImage: `linear-gradient(0deg,rgb(7 9 13 / 18%),rgb(7 9 13 / 18%)),url(/assets/${project.slug}/cover)` } : undefined}><span>{String(index + 1).padStart(2, "0")}</span></div><div className="project-copy"><span className="project-kind">{project.kind === "game" ? "OYUN" : "UYGULAMA"}</span><h3>{project.title}</h3><p>{project.summary}</p><span className="project-link">{content.projectLinkLabel} <ArrowUpRight size={17} /></span></div></Link>)}</div> : <div className="portfolio-empty"><span>{content.emptyNumber}</span><h3>{content.emptyTitle}</h3><p>{content.emptyText}</p></div>}
    </section>
    <footer id="hakkimda"><div className="footer-kicker">{content.footerEyebrow}</div><div className="footer-main"><h2>{profile.headline}</h2><p>{profile.about}{profile.email ? <><br /><br /><a href={`mailto:${profile.email}`}>{profile.email}</a></> : null}</p></div><div className="footer-bottom"><span>{copyright}</span><a href="#top">{content.footerBackLabel}</a></div></footer>
  </main>;
}
