import { Router, type IRouter } from "express";
import healthRouter from "./health";
import modulesRouter from "./modules";
import challengesRouter from "./challenges";
import progressRouter from "./progress";
import docsRouter from "./docs";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/modules", modulesRouter);
router.use("/challenges", challengesRouter);
router.use("/progress", progressRouter);
router.use("/docs", docsRouter);

export default router;
