"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Gamepad2, Search } from "lucide-react";

type CatalogProject = { id: number; slug: string; title: string; kind: "game" | "app"; summary: string; category: string; coverKey: string | null; gameRootKey: string | null; featured: boolean };

export function GameCatalog({ projects }: { projects: CatalogProject[] }) {
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("Tümü");
  const categories = useMemo(() => ["Tümü", ...Array.from(new Set(projects.map((project) => project.category)))], [projects]);
  const filtered = useMemo(() => { const needle = query.trim().toLocaleLowerCase("tr"); return projects.filter((project) => (category === "Tümü" || project.category === category) && (!needle || `${project.title} ${project.summary} ${project.category}`.toLocaleLowerCase("tr").includes(needle))); }, [projects, query, category]);
  if (!projects.length) return <div className="arcade-empty"><Gamepad2 size={40} /><h2>İlk oyun yüklenmeye hazır.</h2><p>Admin panelinden kapak görseli ve index.html içeren oyun ZIP paketini ekleyin.</p></div>;
  return <><div className="catalog-tools"><label className="game-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Oyun ara..." aria-label="Oyun ara" /></label><div className="category-chips" aria-label="Kategoriler">{categories.map((item) => <button key={item} className={item === category ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className="arcade-grid">{filtered.map((project) => <Link key={project.id} className="arcade-card" href={project.kind === "game" ? `/games/${project.slug}` : `/projects/${project.slug}`}><div className={`arcade-cover ${project.coverKey ? "has-cover" : ""}`} style={project.coverKey ? { backgroundImage: `url(/assets/${project.slug}/cover)` } : undefined}><span>{project.kind === "game" ? (project.gameRootKey ? "HEMEN OYNA" : "OYUN") : "UYGULAMA"}</span></div><div className="arcade-copy"><span>{project.category}</span><h3>{project.title}</h3><p>{project.summary}</p><strong>{project.kind === "game" && project.gameRootKey ? "Oyna" : "İncele"} <ArrowUpRight size={16} /></strong></div></Link>)}</div>{!filtered.length && <div className="arcade-empty"><Search size={34} /><h2>Sonuç bulunamadı.</h2><p>Başka bir oyun adı veya kategori deneyin.</p></div>}</>;
}
