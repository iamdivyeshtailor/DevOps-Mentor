import { Router } from "express";
import { db } from "@workspace/db";
import { challengesTable, challengeHintsTable, progressTable, modulesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const moduleIdParam = req.query.moduleId ? parseInt(req.query.moduleId as string, 10) : undefined;
    const difficulty = req.query.difficulty as string | undefined;

    let query = db.select({
      id: challengesTable.id,
      moduleId: challengesTable.moduleId,
      title: challengesTable.title,
      description: challengesTable.description,
      difficulty: challengesTable.difficulty,
      xpReward: challengesTable.xpReward,
      tags: challengesTable.tags,
      isCompleted: sql<boolean>`coalesce(${progressTable.isCompleted}, false)`,
    })
      .from(challengesTable)
      .leftJoin(progressTable, eq(challengesTable.id, progressTable.challengeId))
      .orderBy(challengesTable.sortOrder);

    const conditions = [];
    if (moduleIdParam) conditions.push(eq(challengesTable.moduleId, moduleIdParam));
    if (difficulty) conditions.push(eq(challengesTable.difficulty, difficulty as "beginner" | "intermediate" | "advanced"));
    if (conditions.length) query = query.where(and(...conditions)) as typeof query;

    const rows = await query;
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "listChallenges error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return void res.status(404).json({ error: "Not found" });

    const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, id));
    if (!challenge) return void res.status(404).json({ error: "Not found" });

    const hints = await db.select().from(challengeHintsTable).where(eq(challengeHintsTable.challengeId, id)).orderBy(challengeHintsTable.sortOrder);
    const [progress] = await db.select().from(progressTable).where(eq(progressTable.challengeId, id));

    res.json({
      id: challenge.id,
      moduleId: challenge.moduleId,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      isCompleted: progress?.isCompleted ?? false,
      xpReward: challenge.xpReward,
      content: challenge.content,
      hints: hints.map((h) => h.hint),
      tags: challenge.tags,
    });
  } catch (err) {
    req.log.error({ err }, "getChallenge error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/complete", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return void res.status(404).json({ error: "Not found" });

    const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, id));
    if (!challenge) return void res.status(404).json({ error: "Not found" });

    const [existing] = await db.select().from(progressTable).where(eq(progressTable.challengeId, id));
    let progress;
    if (existing) {
      [progress] = await db.update(progressTable)
        .set({ isCompleted: true, completedAt: new Date() })
        .where(eq(progressTable.challengeId, id))
        .returning();
    } else {
      [progress] = await db.insert(progressTable)
        .values({ challengeId: id, isCompleted: true, completedAt: new Date() })
        .returning();
    }

    res.json({
      challengeId: progress.challengeId,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "completeChallenge error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
