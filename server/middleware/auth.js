import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export function authMiddleware(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.authPayload = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}