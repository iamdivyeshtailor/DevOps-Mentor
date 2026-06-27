import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { challengesTable } from "./challenges";

export const challengeHintsTable = pgTable("challenge_hints", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => challengesTable.id),
  hint: text("hint").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertChallengeHintSchema = createInsertSchema(challengeHintsTable).omit({ id: true });
export type InsertChallengeHint = z.infer<typeof insertChallengeHintSchema>;
export type ChallengeHint = typeof challengeHintsTable.$inferSelect;
