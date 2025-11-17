import bcrypt from "bcryptjs";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import { permissionsForRole } from "../utils/permissions.js";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_NAME } from "./env.js";

export async function ensureDefaultAdmin() {
  let adminUser = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
  if (!adminUser) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    adminUser = await User.create({ email: DEFAULT_ADMIN_EMAIL, name: DEFAULT_ADMIN_NAME, passwordHash, isAnonymous: false });
  }
  else {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    adminUser.passwordHash = passwordHash;
    await adminUser.save();
  }
  let profile = await UserProfile.findOne({ userId: adminUser._id });
  const adminPerms = permissionsForRole("admin");
  if (!profile) {
    profile = await UserProfile.create({ userId: adminUser._id, role: "admin", isActive: true, permissions: adminPerms });
  } else if (profile.role !== "admin") {
    profile.role = "admin";
    profile.permissions = adminPerms;
    await profile.save();
  }
}