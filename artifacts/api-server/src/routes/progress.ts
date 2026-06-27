import { Router } from "express";
import { db } from "@workspace/db";
import { challengesTable, progressTable, modulesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function xpToLevel(xp: number): { level: number; levelName: string; currentLevelXp: number; nextLevelXp: number } {
  const levels = [
    { level: 1, name: "Apprentice", threshold: 0 },
    { level: 2, name: "Explorer", threshold: 200 },
    { level: 3, name: "Practitioner", threshold: 500 },
    { level: 4, name: "Engineer", threshold: 1000 },
    { level: 5, name: "Architect", threshold: 2000 },
    { level: 6, name: "Expert", threshold: 3500 },
    { level: 7, name: "Master", threshold: 5500 },
  ];

  let current = levels[0];
  let next = levels[1];
  for (let i = 0; i < levels.length - 1; i++) {
    if (xp >= levels[i].threshold) {
      current = levels[i];
      next = levels[i + 1] ?? levels[i];
    }
  }
  if (xp >= levels[levels.length - 1].threshold) {
    current = levels[levels.length - 1];
    next = levels[levels.length - 1];
  }

  return {
    level: current.level,
    levelName: current.name,
    currentLevelXp: current.threshold,
    nextLevelXp: next.threshold,
  };
}

router.get("/summary", async (req, res) => {
  try {
    const [totals] = await db.select({
      total: sql<number>`count(*)`,
      completed: sql<number>`count(${progressTable.id}) filter (where ${progressTable.isCompleted} = true)`,
      totalXp: sql<number>`coalesce(sum(${challengesTable.xpReward}) filter (where ${progressTable.isCompleted} = true), 0)`,
    })
      .from(challengesTable)
      .leftJoin(progressTable, eq(challengesTable.id, progressTable.challengeId));

    const moduleProgress = await db.select({
      moduleId: challengesTable.moduleId,
      total: sql<number>`count(*)`,
      completed: sql<number>`count(${progressTable.id}) filter (where ${progressTable.isCompleted} = true)`,
    })
      .from(challengesTable)
      .leftJoin(progressTable, eq(challengesTable.id, progressTable.challengeId))
      .groupBy(challengesTable.moduleId);

    const modulesStarted = moduleProgress.filter((m) => Number(m.completed) > 0).length;
    const modulesCompleted = moduleProgress.filter((m) => Number(m.completed) >= Number(m.total) && Number(m.total) > 0).length;

    const totalXp = Number(totals?.totalXp ?? 0);
    const levelInfo = xpToLevel(totalXp);

    res.json({
      totalXp,
      level: levelInfo.level,
      levelName: levelInfo.levelName,
      currentLevelXp: levelInfo.currentLevelXp,
      nextLevelXp: levelInfo.nextLevelXp,
      completedChallenges: Number(totals?.completed ?? 0),
      totalChallenges: Number(totals?.total ?? 0),
      streakDays: 1,
      modulesStarted,
      modulesCompleted,
    });
  } catch (err) {
    req.log.error({ err }, "getProgressSummary error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/activity", async (req, res) => {
  try {
    const recentCompletions = await db.select({
      id: progressTable.id,
      challengeId: progressTable.challengeId,
      completedAt: progressTable.completedAt,
      challengeTitle: challengesTable.title,
      xpReward: challengesTable.xpReward,
      moduleId: challengesTable.moduleId,
    })
      .from(progressTable)
      .innerJoin(challengesTable, eq(progressTable.challengeId, challengesTable.id))
      .where(eq(progressTable.isCompleted, true))
      .orderBy(sql`${progressTable.completedAt} desc nulls last`)
      .limit(10);

    const moduleIds = [...new Set(recentCompletions.map((r) => r.moduleId))];
    const moduleNames = moduleIds.length
      ? await db.select({ id: modulesTable.id, title: modulesTable.title }).from(modulesTable).where(sql`${modulesTable.id} = any(${sql.raw(`array[${moduleIds.join(",")}]`)})`)
      : [];
    const moduleMap = new Map(moduleNames.map((m) => [m.id, m.title]));

    res.json(recentCompletions.map((r) => ({
      id: r.id,
      type: "challenge_completed",
      title: r.challengeTitle,
      xpEarned: r.xpReward,
      moduleName: moduleMap.get(r.moduleId) ?? null,
      occurredAt: r.completedAt?.toISOString() ?? new Date().toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "getActivityFeed error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
