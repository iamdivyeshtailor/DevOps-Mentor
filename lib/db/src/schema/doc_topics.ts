import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { modulesTable } from "./modules";

export const docTopicsTable = pgTable("doc_topics", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modulesTable.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull().default(""),
  readingMinutes: integer("reading_minutes").notNull().default(5),
  tags: text("tags").array().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertDocTopicSchema = createInsertSchema(docTopicsTable).omit({ id: true });
export type InsertDocTopic = z.infer<typeof insertDocTopicSchema>;
export type DocTopic = typeof docTopicsTable.$inferSelect;
