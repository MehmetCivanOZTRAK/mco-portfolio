"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function slugify(value: string) { return value.toLocaleLowerCase("tr").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

export function ProjectForm() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [slug, setSlug] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const response = await fetch("/api/admin/projects", { method: "POST", body: new FormData(event.currentTarget) }); const result = await response.json(); if (!response.ok) { setError(result.error ?? "Kaydedilemedi."); setBusy(false); return; } router.push("/admin"); router.refresh(); }
  return <form className="admin-form" onSubmit={submit}>
    <div className="field-grid"><label>Proje adı<Input name="title" required minLength={2} maxLength={80} placeholder="Örn. Neon Runner" onChange={(e) => setSlug(slugify(e.target.value))} /></label><label>URL kısa adı<Input name="slug" required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="neon-runner" /></label></div>
    <div className="field-grid"><label>Tür<select name="kind" defaultValue="game"><option value="game">Oyun</option><option value="app">Uygulama</option></select></label><label>Durum<select name="status" defaultValue="draft"><option value="draft">Taslak</option><option value="published">Yayınla</option></select></label></div>
    <label>Kısa açıklama<Input name="summary" required minLength={10} maxLength={220} placeholder="Kartta görünecek kısa açıklama" /></label>
    <label>Detaylı açıklama<Textarea name="description" rows={8} maxLength={6000} placeholder="Projenin amacı, özellikleri ve geliştirme süreci..." /></label>
    <label>Proje bağlantısı<Input name="projectUrl" type="url" placeholder="https://..." /></label>
    <div className="field-grid"><label>Kapak görseli <small>JPG, PNG veya WebP · en fazla 5 MB</small><Input name="cover" type="file" accept="image/jpeg,image/png,image/webp" /></label><label>İndirilebilir dosya <small>ZIP, APK, EXE, MSI, DMG veya AppImage · en fazla 20 MB</small><Input name="projectFile" type="file" accept=".zip,.apk,.exe,.msi,.dmg,.AppImage" /></label></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions"><Button type="button" variant="ghost" onClick={() => router.back()}>Vazgeç</Button><Button type="submit" disabled={busy}>{busy ? "Yükleniyor…" : "Projeyi kaydet"}</Button></div>
  </form>;
}
