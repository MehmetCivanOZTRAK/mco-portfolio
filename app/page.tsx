import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Gamepad2, Shapes } from "lucide-react";
import { getProfile, getPublishedProjects } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [profile, projects] = await Promise.all([getProfile(), getPublishedProjects()]);
  return <main>
    <header className="site-header"><Link className="brand" href="#top" aria-label="Ana sayfa"><span className="brand-mark"><Gamepad2 size={20} /></span><span>{profile.displayName.toUpperCase()}<span className="accent-dot">.</span>DEV</span></Link><nav aria-label="Ana menü"><a href="#projeler">Projeler</a><a href="#hakkimda">Hakkımda</a><Link className="nav-cta" href="/admin">Admin</Link></nav></header>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow"><span /> {profile.role}</p><h1>Oyunlar.<br /><span>Uygulamalar.</span><br />İyi fikirler.</h1><p className="hero-text">{profile.about}</p><a className="primary-action" href="#projeler">Projeleri keşfet <ArrowDownRight size={18} /></a></div><div className="hero-visual" aria-label="Oyun ve uygulama projeleri için soyut vitrin görseli"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="core-card"><Shapes size={38} /><span>BUILD / PLAY / SHIP</span></div><p className="visual-index">01 — PORTFOLIO</p></div></section>
    <section className="projects" id="projeler"><div className="section-heading"><div><p className="eyebrow">Seçili işler</p><h2>Projeler</h2></div><p>{projects.length ? "Yayınladığım oyunları ve uygulamaları keşfedin." : "Yeni projeler üzerinde çalışıyorum. Yakında burada olacaklar."}</p></div>
      {projects.length ? <div className="project-grid">{projects.map((project, index) => <Link className={`project-card ${index % 2 ? "violet" : "cyan"}`} href={`/projects/${project.slug}`} key={project.id}><div className={`project-art ${project.coverKey ? "has-cover" : ""}`} style={project.coverKey ? { backgroundImage: `linear-gradient(0deg,rgb(7 9 13 / 18%),rgb(7 9 13 / 18%)),url(/assets/${project.slug}/cover)` } : undefined}><span>{String(index + 1).padStart(2, "0")}</span></div><div className="project-copy"><span className="project-kind">{project.kind === "game" ? "OYUN" : "UYGULAMA"}</span><h3>{project.title}</h3><p>{project.summary}</p><span className="project-link">Projeyi görüntüle <ArrowUpRight size={17} /></span></div></Link>)}</div> : <div className="portfolio-empty"><span>00</span><h3>İlk proje için alan hazır.</h3><p>Admin panelinden bir oyun veya uygulama yayınladığınızda burada görünecek.</p></div>}
    </section>
    <footer id="hakkimda"><div className="footer-kicker">HAKKIMDA</div><div className="footer-main"><h2>{profile.headline}</h2><p>{profile.about}{profile.email ? <><br /><br /><a href={`mailto:${profile.email}`}>{profile.email}</a></> : null}</p></div><div className="footer-bottom"><span>© 2026 {profile.displayName.toUpperCase()}.DEV</span><a href="#top">Yukarı dön ↑</a></div></footer>
  </main>;
}
