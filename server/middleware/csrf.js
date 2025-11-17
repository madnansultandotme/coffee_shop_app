import { ENABLE_CSRF } from "../config/env.js";

export function csrfMiddleware(req, res, next) {
  const m = req.method;
  if (!ENABLE_CSRF) return next();
  if (m === "GET" || m === "HEAD" || m === "OPTIONS") return next();
  const token = req.headers["x-csrf-token"];
  const expected = req.authPayload?.csrf;
  if (!token || !expected || token !== expected) return res.status(403).json({ error: "CSRF validation failed" });
  next();
}