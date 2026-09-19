"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { projects } from "@/db/schema";

type Project = typeof projects.$inferSelect;
export function ProjectEditForm({ project }: { project: Project }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const body = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, { method: "PUT", body });
      const result = await response.json() as { error?: string };
      if (response.status === 401) { window.location.href = `/login?return_to=/admin/projects/${project.id}/edit`; return; }
      if (!response.ok) { setError(result.error ?? "Kaydedilemedi."); return; }
      router.push("/admin"); router.refresh();
    } catch { setError("Sunucuya ulaşılamadı veya yükleme kesildi. Tekrar deneyin."); }
    finally { setBusy(false); }
  }
  return <form className="admin-form" onSubmit={submit}><div className="field-grid"><label>Proje adı<Input name="title" defaultValue={project.title} required minLength={2} maxLength={80} /></label><label>URL kısa adı<Input name="slug" defaultValue={project.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label></div><div className="field-grid"><label>Tür<select name="kind" defaultValue={project.kind}><option value="game">Oyun</option><option value="app">Uygulama</option></select></label><label>Kategori<Input name="category" defaultValue={project.category} required maxLength={40} /></label></div><div className="field-grid"><label>Durum<select name="status" defaultValue={project.status}><option value="draft">Taslak</option><option value="published">Yayında</option></select></label><label className="check-label"><input name="featured" type="checkbox" defaultChecked={project.featured} /> Ana sayfada öne çıkar</label></div><label>Kısa açıklama<Input name="summary" defaultValue={project.summary} required minLength={10} maxLength={220} /></label><label>Detaylı açıklama<Textarea name="description" defaultValue={project.description} rows={8} maxLength={6000} /></label><label>Proje bağlantısı<Input name="projectUrl" defaultValue={project.projectUrl ?? ""} type="url" /></label><div className="field-grid"><label>Yeni kapak <small>Boş bırakırsanız mevcut kapak korunur.</small><Input name="cover" type="file" accept="image/jpeg,image/png,image/webp" /></label><label>Yeni indirilebilir dosya <small>Boş bırakırsanız mevcut dosya korunur.</small><Input name="projectFile" type="file" accept=".zip,.apk,.exe,.msi,.dmg,.AppImage" /></label></div><label>Yeni Unity WebGL / HTML5 paketi <small>Build klasörünü ZIP'leyin; index.html kökte veya tek bir üst klasörde olabilir · en fazla 50 MB. Mevcut oynanabilir paketin yerini alır.</small><Input name="webGame" type="file" accept=".zip,application/zip" /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Button type="button" variant="ghost" onClick={() => router.back()}>Vazgeç</Button><Button disabled={busy}>{busy ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</Button></div></form>;
}
