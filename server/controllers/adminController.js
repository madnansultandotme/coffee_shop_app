import UserProfile from "../models/UserProfile.js";
import User from "../models/User.js";
import { permissionsForRole } from "../utils/permissions.js";

export async function staff(req, res) {
  const profiles = await UserProfile.find({ role: { $ne: "customer" } });
  const enriched = await Promise.all(profiles.map(async p => {
    const user = await User.findById(p.userId);
    return { ...p.toObject(), user };
  }));
  return res.json(enriched);
}

export async function updateUserRole(req, res) {
  const { role, isActive } = req.body;
  const userId = req.params.id;
  const targetProfile = await UserProfile.findOne({ userId });
  if (role === "admin") return res.status(403).json({ error: "Cannot assign admin role" });
  if (targetProfile && targetProfile.role === "admin" && role !== "admin") return res.status(403).json({ error: "Cannot modify admin role" });
  const data = { role, permissions: permissionsForRole(role), isActive: isActive ?? true };
  if (targetProfile) {
    Object.assign(targetProfile, data);
    await targetProfile.save();
  } else {
    await UserProfile.create({ userId, ...data });
  }
  return res.json({ ok: true });
}

export async function reviews(req, res) {
  return res.json([]);
}