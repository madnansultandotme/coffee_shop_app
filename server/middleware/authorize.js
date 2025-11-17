import UserProfile from "../models/UserProfile.js";

export function requireRole(...roles) {
  return async (req, res, next) => {
    const profile = await UserProfile.findOne({ userId: req.userId });
    const role = profile?.role || "guest";
    if (!roles.includes(role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

export async function getUserRole(req) {
  const profile = await UserProfile.findOne({ userId: req.userId });
  return profile?.role || "guest";
}