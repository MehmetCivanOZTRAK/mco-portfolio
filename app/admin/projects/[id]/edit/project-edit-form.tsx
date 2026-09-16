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
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(["title", "slug", "kind", "summary", "description", "status", "projectUrl"].map((key) => [key, String(form.get(key) ?? "")]));
    const response = await fetch(`/api/admin/projects/${project.id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Kaydedilemedi."); setBusy(false); return; }
    router.push("/admin"); router.refresh();
  }
  return <form className="admin-form" onSubmit={submit}><div className="field-grid"><label>Proje adı<Input name="title" defaultValue={project.title} required minLength={2} maxLength={80} /></label><label>URL kısa adı<Input name="slug" defaultValue={project.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label></div><div className="field-grid"><label>Tür<select name="kind" defaultValue={project.kind}><option value="game">Oyun</option><option value="app">Uygulama</option></select></label><label>Durum<select name="status" defaultValue={project.status}><option value="draft">Taslak</option><option value="published">Yayında</option></select></label></div><label>Kısa açıklama<Input name="summary" defaultValue={project.summary} required minLength={10} maxLength={220} /></label><label>Detaylı açıklama<Textarea name="description" defaultValue={project.description} rows={8} maxLength={6000} /></label><label>Proje bağlantısı<Input name="projectUrl" defaultValue={project.projectUrl ?? ""} type="url" /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Button type="button" variant="ghost" onClick={() => router.back()}>Vazgeç</Button><Button disabled={busy}>{busy ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</Button></div></form>;
}
