import { env } from "cloudflare:workers";
import {
  defaultContent,
  portfolioContentSchema,
  type PortfolioContent,
} from "@/lib/content";

type ContentRow = { value: string };
type ColumnRow = { name: string };

let schemaReady: Promise<void> | undefined;
let contentColumn: Promise<"content" | "payload"> | undefined;

function database() {
  if (!env.DB) throw new Error("Cloudflare D1 binding `DB` kullanılamıyor.");
  return env.DB;
}

function ensureContentTable() {
  schemaReady ??= database()
    .prepare(`
      CREATE TABLE IF NOT EXISTS site_content (
        id INTEGER PRIMARY KEY NOT NULL,
        content TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)
    .run()
    .then(() => undefined)
    .catch((error) => {
      schemaReady = undefined;
      throw error;
    });

  return schemaReady;
}

async function resolveContentColumn() {
  await ensureContentTable();
  contentColumn ??= database()
    .prepare("PRAGMA table_info(site_content)")
    .all<ColumnRow>()
    .then(({ results }) => results.some((column) => column.name === "content") ? "content" : "payload")
    .catch((error) => {
      contentColumn = undefined;
      throw error;
    });
  return contentColumn;
}

export async function readPortfolioContent(): Promise<PortfolioContent> {
  try {
    const column = await resolveContentColumn();
    const row = await database()
      .prepare(`SELECT ${column} AS value FROM site_content WHERE id = 1`)
      .first<ContentRow>();

    if (!row) return defaultContent;
    return portfolioContentSchema.parse(JSON.parse(row.value));
  } catch (error) {
    console.warn("Portfolio content fallback is in use:", error instanceof Error ? error.message : "Unknown error");
    return defaultContent;
  }
}

export async function writePortfolioContent(content: PortfolioContent) {
  const validated = portfolioContentSchema.parse(content);
  const column = await resolveContentColumn();
  const payload = JSON.stringify(validated);

  await database().prepare(`
    INSERT INTO site_content (id, ${column}, updated_at)
    VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      ${column} = excluded.${column},
      updated_at = excluded.updated_at
  `).bind(payload, Date.now()).run();

  return validated;
}
