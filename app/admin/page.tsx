import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllProjects } from "@/lib/portfolio";
import { ProjectActions } from "./project-actions";

export default async function AdminPage() {
  const projects = await getAllProjects(); const published = projects.filter((p) => p.status === "published").length;
  return <><div className="admin-heading"><div><p className="eyebrow">Yönetim paneli</p><h1>Projeler</h1><p>Oyun ve uygulamalarını tek yerden yayınla.</p></div><Button asChild><Link href="/admin/projects/new"><Plus /> Yeni proje</Link></Button></div>
    <div className="stat-grid"><Card><CardHeader><CardDescription>Toplam proje</CardDescription><CardTitle className="stat-number">{projects.length}</CardTitle></CardHeader></Card><Card><CardHeader><CardDescription>Yayında</CardDescription><CardTitle className="stat-number">{published}</CardTitle></CardHeader></Card><Card><CardHeader><CardDescription>Taslak</CardDescription><CardTitle className="stat-number">{projects.length - published}</CardTitle></CardHeader></Card></div>
    <Card className="admin-card"><CardHeader><CardTitle>Proje listesi</CardTitle><CardDescription>Metinleri, oyun paketini ve yayın durumunu yönetin.</CardDescription></CardHeader><CardContent>{projects.length ? <Table><TableHeader><TableRow><TableHead>Proje</TableHead><TableHead>Kategori</TableHead><TableHead>Oynanabilir</TableHead><TableHead>Durum</TableHead><TableHead className="text-right">İşlemler</TableHead></TableRow></TableHeader><TableBody>{projects.map((project) => <TableRow key={project.id}><TableCell><strong>{project.title}</strong><span className="table-sub">/{project.slug}</span></TableCell><TableCell>{project.category}</TableCell><TableCell>{project.gameRootKey ? "Evet" : "—"}</TableCell><TableCell><Badge variant={project.status === "published" ? "default" : "secondary"}>{project.status === "published" ? "Yayında" : "Taslak"}</Badge></TableCell><TableCell><ProjectActions id={project.id} status={project.status} /></TableCell></TableRow>)}</TableBody></Table> : <div className="empty-state"><p>Henüz proje eklenmedi.</p><Button asChild variant="outline"><Link href="/admin/projects/new">İlk projeyi ekle</Link></Button></div>}</CardContent></Card>
  </>;
}
