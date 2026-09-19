import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getProjectBySlug, getSiteContent } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const [project, content] = await Promise.all([getProjectBySlug((await params).slug), getSiteContent()]);
  if (!project || project.kind !== "game") notFound();
  return <main className="game-page"><header className="game-topbar"><Link href="/"><ArrowLeft size={18} /> {content.gameBackLabel}</Link><div><span>{project.category}</span><strong>{project.title}</strong></div></header>{project.gameRootKey ? <section className="game-stage"><iframe title={`${project.title} oyunu`} src={`/game-files/${project.slug}/index.html`} sandbox="allow-scripts allow-pointer-lock allow-forms allow-modals allow-popups" allow="fullscreen; autoplay; gamepad" allowFullScreen /></section> : <section className="game-unavailable"><span>{content.gameMissingLabel}</span><h1>{project.title}</h1><p>{content.gameMissingText}</p></section>}<section className="game-info"><div><p className="eyebrow">{project.category}</p><h1>{project.title}</h1><p>{project.summary}</p></div><div className="detail-actions">{project.fileKey && <a className="secondary-action" href={`/downloads/${project.slug}`}><Download size={18} /> {content.downloadLabel}</a>}{project.projectUrl && <a className="secondary-action" href={project.projectUrl} target="_blank" rel="noreferrer"><ExternalLink size={18} /> {content.projectUrlLabel}</a>}</div>{project.description && <div className="game-description">{project.description.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}</section></main>;
}
