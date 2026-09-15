import { getDb } from "@/db";
import { profiles, projects } from "@/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function DatabasePage() {
  let projectRows: typeof projects.$inferSelect[] = []; let profileRows: typeof profiles.$inferSelect[] = []; let unavailable = false;
  try { [projectRows, profileRows] = await Promise.all([getDb().select().from(projects).limit(100), getDb().select().from(profiles).limit(10)]); } catch { unavailable = true; }
  return <><div className="admin-heading"><div><p className="eyebrow">Salt okunur görünüm</p><h1>Veritabanı</h1><p>Yalnızca izin verilen tablolar ve alanlar gösterilir; ham SQL çalıştırılamaz.</p></div></div>{unavailable ? <Card className="admin-card"><CardHeader><CardTitle>Veritabanı hazırlanıyor</CardTitle><CardDescription>İlk yayınla birlikte D1 tabloları oluşturulacak.</CardDescription></CardHeader></Card> : <div className="database-stack"><DataTable title="projects" rows={projectRows.map((row) => ({ id: row.id, slug: row.slug, title: row.title, kind: row.kind, status: row.status, created_at: row.createdAt }))} /><DataTable title="profiles" rows={profileRows.map((row) => ({ id: row.id, display_name: row.displayName, role: row.role, email: row.email, updated_at: row.updatedAt }))} /></div>}</>;
}

function DataTable({ title, rows }: { title: string; rows: Record<string, unknown>[] }) { const keys = rows[0] ? Object.keys(rows[0]) : []; return <Card className="admin-card"><CardHeader><CardTitle className="mono-title">{title}</CardTitle><CardDescription>{rows.length} kayıt · en fazla 100 satır</CardDescription></CardHeader><CardContent>{rows.length ? <Table><TableHeader><TableRow>{keys.map((key) => <TableHead key={key}>{key}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={index}>{keys.map((key) => <TableCell key={key}>{String(row[key] ?? "—")}</TableCell>)}</TableRow>)}</TableBody></Table> : <div className="empty-state"><p>Tablo boş.</p></div>}</CardContent></Card>; }
