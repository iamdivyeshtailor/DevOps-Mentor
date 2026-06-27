import { pgTable, serial, text, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryEnum = pgEnum("category", ["containers", "ci_cd", "cloud", "infrastructure", "orchestration"]);

export const modulesTable = pgTable("modules", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: categoryEnum("category").notNull(),
  estimatedHours: integer("estimated_hours").notNull().default(0),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertModuleSchema = createInsertSchema(modulesTable).omit({ id: true });
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modulesTable.$inferSelect;
