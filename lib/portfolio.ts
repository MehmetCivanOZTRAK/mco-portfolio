import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles, projects } from "@/db/schema";

export const fallbackProfile = { displayName: "Ciwan", role: "Bağımsız geliştirici", headline: "Fikirleri oynanabilir ve kullanılabilir ürünlere dönüştürüyorum.", about: "Oyun geliştirme, arayüz tasarımı ve ürün odaklı yazılım geliştirme üzerine çalışıyorum.", email: "" };

export async function getPublishedProjects() {
  try { return await getDb().select().from(projects).where(eq(projects.status, "published")).orderBy(desc(projects.createdAt)); } catch { return []; }
}
export async function getAllProjects() {
  try { return await getDb().select().from(projects).orderBy(desc(projects.createdAt)); } catch { return []; }
}
export async function getProjectBySlug(slug: string, includeDraft = false) {
  try { const [project] = await getDb().select().from(projects).where(eq(projects.slug, slug)).limit(1); return project && (includeDraft || project.status === "published") ? project : null; } catch { return null; }
}
export async function getProfile() {
  try { const [profile] = await getDb().select().from(profiles).limit(1); return profile ?? fallbackProfile; } catch { return fallbackProfile; }
}
