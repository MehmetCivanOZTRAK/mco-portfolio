import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }), slug: text("slug").notNull(), title: text("title").notNull(),
  kind: text("kind", { enum: ["game", "app"] }).notNull(), summary: text("summary").notNull(), description: text("description").notNull().default(""),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"), projectUrl: text("project_url"),
  category: text("category").notNull().default("Genel"), featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  coverKey: text("cover_key"), fileKey: text("file_key"), fileName: text("file_name"), fileSize: integer("file_size"),
  gameRootKey: text("game_root_key"), playCount: integer("play_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_projects_slug").on(table.slug),
  index("idx_projects_status_created").on(table.status, table.createdAt),
]);

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey(), displayName: text("display_name").notNull(), role: text("role").notNull(), headline: text("headline").notNull(),
  about: text("about").notNull(), email: text("email").notNull().default(""), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const siteContent = sqliteTable("site_content", {
  id: integer("id").primaryKey(),
  content: text("content").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  identifier: text("identifier").primaryKey(),
  failures: integer("failures").notNull().default(0),
  blockedUntil: text("blocked_until"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
