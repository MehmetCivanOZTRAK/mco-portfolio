"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, KeyRound, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminLoginForm({ localPassword }: { localPassword?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Giriş yapılamadı.");
      router.push("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Giriş yapılamadı.");
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <button type="button" className="admin-login-back" onClick={() => window.location.assign(new URL("/", window.location.origin).toString())}>
        <ArrowLeft size={16} /> Portfolyoya dön
      </button>
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-icon"><KeyRound /></div>
        <p className="eyebrow">Yönetim alanı</p>
        <h1>Admin paneline giriş</h1>
        <p>İçerikleri, projeleri, fotoğrafı ve PDF belgelerini düzenlemek için yönetici şifresini girin.</p>
        <label className="admin-field">
          <span>Yönetici şifresi</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus />
        </label>
        {localPassword && <small className="local-password-note">Yerel geliştirme şifresi: <b>{localPassword}</b></small>}
        {error && <output className="login-error">{error}</output>}
        <button className="admin-button primary" type="submit" disabled={busy}>{busy ? "Giriş yapılıyor…" : <><LogIn size={17} /> Giriş yap</>}</button>
      </form>
    </main>
  );
}
