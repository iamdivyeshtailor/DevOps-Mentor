import { Router } from "express";
import { db } from "@workspace/db";
import { docTopicsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/topics", async (req, res) => {
  try {
    const moduleIdParam = req.query.moduleId ? parseInt(req.query.moduleId as string, 10) : undefined;

    let query = db.select({
      id: docTopicsTable.id,
      moduleId: docTopicsTable.moduleId,
      title: docTopicsTable.title,
      summary: docTopicsTable.summary,
      readingMinutes: docTopicsTable.readingMinutes,
      tags: docTopicsTable.tags,
    }).from(docTopicsTable).orderBy(docTopicsTable.sortOrder);

    if (moduleIdParam) {
      query = query.where(eq(docTopicsTable.moduleId, moduleIdParam)) as typeof query;
    }

    const rows = await query;
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "listDocTopics error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/topics/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return void res.status(404).json({ error: "Not found" });

    const [topic] = await db.select().from(docTopicsTable).where(eq(docTopicsTable.id, id));
    if (!topic) return void res.status(404).json({ error: "Not found" });

    res.json({
      id: topic.id,
      moduleId: topic.moduleId,
      title: topic.title,
      summary: topic.summary,
      content: topic.content,
      readingMinutes: topic.readingMinutes,
      tags: topic.tags,
    });
  } catch (err) {
    req.log.error({ err }, "getDocTopic error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
