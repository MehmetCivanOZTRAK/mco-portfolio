"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ProjectActions({ id, status }: { id: number; status: "draft" | "published" }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function update(next: "draft" | "published") { setBusy(true); setError(""); const response = await fetch(`/api/admin/projects/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: next }) }); const result = await response.json(); if (!response.ok) setError(result.error); else router.refresh(); setBusy(false); }
  async function remove() { if (!window.confirm("Bu proje ve yüklenen dosyaları silinsin mi?")) return; setBusy(true); const response = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" }); const result = await response.json(); if (!response.ok) setError(result.error); else router.refresh(); setBusy(false); }
  return <div className="row-actions"><Button size="sm" variant="outline" disabled={busy} onClick={() => update(status === "published" ? "draft" : "published")}>{status === "published" ? "Taslağa al" : "Yayınla"}</Button><Button size="sm" variant="destructive" disabled={busy} onClick={remove}>Sil</Button>{error && <span className="form-error">{error}</span>}</div>;
}
