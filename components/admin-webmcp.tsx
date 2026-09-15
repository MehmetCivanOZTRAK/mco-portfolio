"use client";
import { useEffect } from "react";

type ToolInput = { id?: number; status?: "draft" | "published" };
type ModelContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: object; execute: (input: ToolInput) => Promise<unknown> }, options?: { signal?: AbortSignal }) => void | Promise<void> };

export function AdminWebMcp() {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext; if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name: "list_portfolio_projects", title: "Portfolyo projelerini listele", description: "Admin panelindeki oyun ve uygulamaları, yayın durumlarıyla birlikte listeler.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: true }, async execute() { const response = await fetch("/api/admin/projects"); if (!response.ok) throw new Error("Projeler alınamadı."); return response.json(); } }, { signal: lifecycle.signal })).catch(() => undefined);
    void Promise.resolve(context.registerTool({ name: "set_portfolio_project_status", title: "Proje yayın durumunu değiştir", description: "Belirtilen projenin durumunu taslak veya yayında olarak değiştirir.", inputSchema: { type: "object", properties: { id: { type: "integer", minimum: 1 }, status: { type: "string", enum: ["draft", "published"] } }, required: ["id", "status"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, async execute(input) { if (!Number.isInteger(input.id) || !["draft", "published"].includes(input.status ?? "")) throw new Error("Geçersiz proje bilgisi."); const response = await fetch(`/api/admin/projects/${input.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: input.status }) }); if (!response.ok) throw new Error("Durum değiştirilemedi."); return response.json(); } }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
  return null;
}
