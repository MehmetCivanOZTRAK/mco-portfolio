import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const siteContent = sqliteTable("site_content", {
  id: integer("id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  identifier: text("identifier").primaryKey(),
  failures: integer("failures").notNull().default(0),
  blockedUntil: integer("blocked_until").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});
