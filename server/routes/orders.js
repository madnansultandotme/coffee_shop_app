import { Router } from "express";
import { listOwn, reorder, create } from "../controllers/ordersController.js";
import { authMiddleware } from "../middleware/auth.js";
import { csrfMiddleware } from "../middleware/csrf.js";

const router = Router();

router.get("/", authMiddleware, listOwn);
router.post("/reorder", authMiddleware, csrfMiddleware, reorder);
router.post("/", authMiddleware, csrfMiddleware, create);

export default router;