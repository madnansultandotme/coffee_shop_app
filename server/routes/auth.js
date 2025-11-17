import { Router } from "express";
import { signIn, anonymous } from "../controllers/authController.js";

const router = Router();

router.post("/sign-in", signIn);
router.post("/anonymous", anonymous);

export default router;