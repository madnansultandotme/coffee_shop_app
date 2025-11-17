function sanitizeValue(v) {
  if (typeof v === "string") {
    return v
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }
  if (Array.isArray(v)) return v.map(sanitizeValue);
  if (v && typeof v === "object") return sanitizeObject(v);
  return v;
}

function sanitizeObject(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$") || k === "__proto__") continue;
    out[k] = sanitizeValue(v);
  }
  return out;
}

export function sanitizeMiddleware(req, _res, next) {
  if (req.body && typeof req.body === "object") req.body = sanitizeObject(req.body);
  if (req.query && typeof req.query === "object") req.query = sanitizeObject(req.query);
  next();
}