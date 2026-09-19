"use client";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Profile = { displayName: string; role: string; headline: string; about: string; email: string };
export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, setState] = useState<"idle" | "busy" | "saved">("idle"); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setState("busy"); setError(""); const form = new FormData(event.currentTarget); const body = Object.fromEntries(["displayName", "role", "headline", "about", "email"].map((key) => [key, String(form.get(key) ?? "")])); try { const response = await fetch("/api/admin/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const result = await response.json() as { error?: string }; if (response.status === 401) { window.location.href = "/login?return_to=/admin/profile"; return; } if (!response.ok) { setError(result.error ?? "Kaydedilemedi."); setState("idle"); } else setState("saved"); } catch { setError("Sunucuya ulaşılamadı. Tekrar deneyin."); setState("idle"); } }
  return <form className="admin-form" onSubmit={submit}><div className="field-grid"><label>Görünen ad<Input name="displayName" defaultValue={profile.displayName} required /></label><label>Rol<Input name="role" defaultValue={profile.role} required /></label></div><label>Ana mesaj<Input name="headline" defaultValue={profile.headline} required maxLength={180} /></label><label>Hakkımda<Textarea name="about" defaultValue={profile.about} required rows={8} maxLength={2000} /></label><label>E-posta<Input name="email" defaultValue={profile.email} type="email" /></label>{error && <p className="form-error">{error}</p>}<div className="form-actions"><Button disabled={state === "busy"}>{state === "busy" ? "Kaydediliyor…" : state === "saved" ? "Kaydedildi" : "Profili kaydet"}</Button></div></form>;
}
