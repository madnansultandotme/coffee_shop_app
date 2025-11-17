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
  let profile = await UserProfile.findOne({ userId });
  const data = { role, permissions: permissionsForRole(role), isActive: isActive ?? true };
  if (profile) {
    Object.assign(profile, data);
    await profile.save();
  } else {
    profile = await UserProfile.create({ userId, ...data });
  }
  return res.json({ ok: true });
}

export async function reviews(req, res) {
  return res.json([]);
}