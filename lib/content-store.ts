import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { siteContent } from "@/db/schema";
import {
  defaultContent,
  portfolioContentSchema,
  type PortfolioContent,
} from "@/lib/content";

let schemaReady: Promise<void> | undefined;

function ensureContentTable() {
  schemaReady ??= getDb()
    .run(sql`
      CREATE TABLE IF NOT EXISTS site_content (
        id integer PRIMARY KEY NOT NULL,
        payload text NOT NULL,
        updated_at integer NOT NULL
      )
    `)
    .then(() => undefined)
    .catch((error) => {
      schemaReady = undefined;
      throw error;
    });

  return schemaReady;
}

export async function readPortfolioContent(): Promise<PortfolioContent> {
  try {
    await ensureContentTable();
    const db = getDb();
    const [row] = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.id, 1))
      .limit(1);

    if (!row) return defaultContent;
    return portfolioContentSchema.parse(JSON.parse(row.payload));
  } catch (error) {
    console.warn("Portfolio content fallback is in use:", error);
    return defaultContent;
  }
}

export async function writePortfolioContent(content: PortfolioContent) {
  const validated = portfolioContentSchema.parse(content);
  await ensureContentTable();
  const db = getDb();
  await db
    .insert(siteContent)
    .values({ id: 1, payload: JSON.stringify(validated), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteContent.id,
      set: { payload: JSON.stringify(validated), updatedAt: new Date() },
    });
  return validated;
}
