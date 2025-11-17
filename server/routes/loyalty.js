import { Router } from "express";
import { summary, transactions } from "../controllers/loyaltyController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/summary", authMiddleware, summary);
router.get("/transactions", authMiddleware, transactions);

export default router;