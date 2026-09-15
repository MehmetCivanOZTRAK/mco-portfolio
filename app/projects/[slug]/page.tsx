import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download } from "lucide-react";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getProjectBySlug((await params).slug); if (!project) notFound();
  return <main className="detail-page"><header className="detail-header"><Link href="/"><ArrowLeft /> Ana sayfa</Link><span>{project.kind === "game" ? "OYUN" : "UYGULAMA"}</span></header><article className="detail-content"><div className={`detail-cover ${project.coverKey ? "has-cover" : ""}`} style={project.coverKey ? { backgroundImage: `url(/assets/${project.slug}/cover)` } : undefined}><span>{project.kind === "game" ? "PLAY" : "USE"}</span></div><div className="detail-copy"><p className="eyebrow">{project.kind === "game" ? "Bağımsız oyun" : "Bağımsız uygulama"}</p><h1>{project.title}</h1><p className="detail-summary">{project.summary}</p><div className="detail-actions">{project.fileKey && <a className="primary-action" href={`/downloads/${project.slug}`}><Download size={18} /> İndir</a>}{project.projectUrl && <a className="secondary-action" href={project.projectUrl} target="_blank" rel="noreferrer">Projeye git <ArrowUpRight size={18} /></a>}</div><div className="detail-description">{project.description.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></div></article></main>;
}
