import { Router } from "express";
import { add, list, update, remove, clear } from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/auth.js";
import { csrfMiddleware } from "../middleware/csrf.js";

const router = Router();

router.post("/add", authMiddleware, csrfMiddleware, add);
router.get("/", authMiddleware, list);
router.patch("/:id", authMiddleware, csrfMiddleware, update);
router.delete("/:id", authMiddleware, csrfMiddleware, remove);
router.delete("/", authMiddleware, csrfMiddleware, clear);

export default router;