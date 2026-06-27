import { Router } from "express";
import { db } from "@workspace/db";
import { modulesTable, challengesTable, progressTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const modules = await db.select().from(modulesTable).orderBy(modulesTable.sortOrder);

    const progressCounts = await db
      .select({
        moduleId: challengesTable.moduleId,
        total: sql<number>`count(*)`.as("total"),
        completed: sql<number>`count(${progressTable.id}) filter (where ${progressTable.isCompleted} = true)`.as("completed"),
      })
      .from(challengesTable)
      .leftJoin(progressTable, eq(challengesTable.id, progressTable.challengeId))
      .groupBy(challengesTable.moduleId);

    const countMap = new Map(progressCounts.map((p) => [p.moduleId, p]));

    const result = modules.map((m) => {
      const counts = countMap.get(m.id);
      return {
        id: m.id,
        slug: m.slug,
        title: m.title,
        description: m.description,
        icon: m.icon,
        category: m.category,
        estimatedHours: m.estimatedHours,
        isUnlocked: m.isUnlocked,
        totalChallenges: Number(counts?.total ?? 0),
        completedChallenges: Number(counts?.completed ?? 0),
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "listModules error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return void res.status(404).json({ error: "Not found" });

    const [module] = await db.select().from(modulesTable).where(eq(modulesTable.id, id));
    if (!module) return void res.status(404).json({ error: "Not found" });

    const challenges = await db.select().from(challengesTable).where(eq(challengesTable.moduleId, id)).orderBy(challengesTable.sortOrder);
    const progressRows = await db.select().from(progressTable).where(
      sql`${progressTable.challengeId} = any(${sql.raw(`array[${challenges.map((c) => c.id).join(",") || "null"}]`)})`,
    );
    const progressMap = new Map(progressRows.map((p) => [p.challengeId, p]));

    res.json({
      id: module.id,
      slug: module.slug,
      title: module.title,
      description: module.description,
      icon: module.icon,
      category: module.category,
      isUnlocked: module.isUnlocked,
      challenges: challenges.map((c) => {
        const p = progressMap.get(c.id);
        return {
          id: c.id,
          moduleId: c.moduleId,
          title: c.title,
          description: c.description,
          difficulty: c.difficulty,
          isCompleted: p?.isCompleted ?? false,
          xpReward: c.xpReward,
          tags: c.tags,
        };
      }),
    });
  } catch (err) {
    req.log.error({ err }, "getModule error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
