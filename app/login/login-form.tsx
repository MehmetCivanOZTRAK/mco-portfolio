"use client";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Giriş yapılamadı."); setBusy(false); return; }
    const returnTo = new URLSearchParams(window.location.search).get("return_to");
    window.location.href = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/admin";
  }
  return <form className="admin-form login-form" onSubmit={submit}><label>E-posta<Input type="email" name="email" autoComplete="username" required /></label><label>Şifre<Input type="password" name="password" autoComplete="current-password" required minLength={10} /></label>{error && <p className="form-error" role="alert">{error}</p>}<Button disabled={busy}>{busy ? "Giriş yapılıyor…" : "Giriş yap"}</Button></form>;
}
