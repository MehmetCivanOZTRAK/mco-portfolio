"use client";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fallbackSiteContent } from "@/lib/site-content";

type Content = typeof fallbackSiteContent;
const groups: { title: string; fields: { key: keyof Content; label: string; multiline?: boolean }[] }[] = [
  { title: "Menü ve marka", fields: [{ key: "brandLabel", label: "Marka metni" }, { key: "navProjects", label: "Projeler menüsü" }, { key: "navAbout", label: "Hakkımda menüsü" }, { key: "navAdmin", label: "Admin menüsü" }] },
  { title: "Giriş alanı", fields: [{ key: "heroLine1", label: "Başlık 1. satır" }, { key: "heroLine2", label: "Başlık 2. satır" }, { key: "heroLine3", label: "Başlık 3. satır" }, { key: "heroCta", label: "Ana buton" }, { key: "visualBadge", label: "Görsel merkez metni" }, { key: "visualIndex", label: "Görsel alt metni" }] },
  { title: "Projeler bölümü", fields: [{ key: "projectsEyebrow", label: "Üst etiket" }, { key: "projectsTitle", label: "Bölüm başlığı" }, { key: "projectsDescription", label: "Projeler varken açıklama", multiline: true }, { key: "projectsEmptyDescription", label: "Proje yokken açıklama", multiline: true }, { key: "emptyNumber", label: "Boş durum numarası" }, { key: "emptyTitle", label: "Boş durum başlığı" }, { key: "emptyText", label: "Boş durum açıklaması", multiline: true }, { key: "projectLinkLabel", label: "Proje kartı bağlantısı" }] },
  { title: "Footer ve proje detayları", fields: [{ key: "footerEyebrow", label: "Footer etiketi" }, { key: "footerBackLabel", label: "Yukarı dön bağlantısı" }, { key: "copyrightText", label: "Telif metni" }, { key: "detailBackLabel", label: "Geri bağlantısı" }, { key: "detailGameLabel", label: "Oyun türü etiketi" }, { key: "detailAppLabel", label: "Uygulama türü etiketi" }, { key: "downloadLabel", label: "İndirme butonu" }, { key: "projectUrlLabel", label: "Proje bağlantısı butonu" }] },
];

export function ContentForm({ content }: { content: Content }) {
  const [state, setState] = useState<"idle" | "busy" | "saved">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("busy"); setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(Object.keys(fallbackSiteContent).map((key) => [key, String(form.get(key) ?? "")]));
    const response = await fetch("/api/admin/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Kaydedilemedi."); setState("idle"); return; }
    setState("saved");
  }
  return <form className="admin-form" onSubmit={submit}>{groups.map((group) => <fieldset className="content-group" key={group.title}><legend>{group.title}</legend><div className="field-grid">{group.fields.map((field) => <label key={field.key}>{field.label}{field.multiline ? <Textarea name={field.key} defaultValue={content[field.key]} rows={3} maxLength={300} required /> : <Input name={field.key} defaultValue={content[field.key]} maxLength={300} required />}</label>)}</div></fieldset>)}{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Button disabled={state === "busy"}>{state === "busy" ? "Kaydediliyor…" : state === "saved" ? "Kaydedildi" : "Tüm metinleri kaydet"}</Button></div></form>;
}
