import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectById } from "@/lib/portfolio";
import { ProjectEditForm } from "./project-edit-form";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const project = Number.isInteger(id) && id > 0 ? await getProjectById(id) : null;
  if (!project) notFound();
  return <><div className="admin-heading"><div><p className="eyebrow">İçerik düzenleme</p><h1>{project.title}</h1><p>Projenin tüm yazılarını, bağlantısını ve yayın durumunu değiştirin.</p></div></div><Card className="admin-card form-card"><CardHeader><CardTitle>Proje bilgileri</CardTitle><CardDescription>Kapak ve yükleme dosyası korunur; yeni dosya için projeyi yeniden ekleyebilirsiniz.</CardDescription></CardHeader><CardContent><ProjectEditForm project={project} /></CardContent></Card></>;
}
