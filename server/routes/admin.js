import { Router } from "express";
import { staff, updateUserRole, reviews } from "../controllers/adminController.js";
import { adminCategories, adminItems } from "../controllers/menuController.js";
import { listAll, updateStatus } from "../controllers/ordersController.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

const router = Router();

router.get("/staff", authMiddleware, requireRole("admin"), staff);
router.patch("/users/:id/role", authMiddleware, requireRole("admin"), updateUserRole);
router.get("/reviews", authMiddleware, requireRole("admin"), reviews);
router.get("/orders", authMiddleware, requireRole("admin"), listAll);
router.patch("/orders/:id/status", authMiddleware, requireRole("admin"), updateStatus);
router.get("/menu/categories", authMiddleware, requireRole("admin"), adminCategories);
router.get("/menu/items", authMiddleware, requireRole("admin"), adminItems);

export default router;