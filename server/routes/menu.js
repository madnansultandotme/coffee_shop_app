import { Router } from "express";
import { categories, items, search } from "../controllers/menuController.js";

const router = Router();

router.get("/categories", categories);
router.get("/items", items);
router.get("/search", search);

export default router;