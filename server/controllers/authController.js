import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import { permissionsForRole } from "../utils/permissions.js";
import { JWT_SECRET } from "../config/env.js";

export async function signIn(req, res) {
  const { email, password, flow } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing credentials" });
  const existing = await User.findOne({ email });
  if (flow === "signUp") {
    if (existing) return res.status(400).json({ error: "Account exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name: email.split("@")[0], passwordHash, isAnonymous: false });
    const profile = await UserProfile.create({ userId: user._id, role: "customer", isActive: true, permissions: permissionsForRole("customer") });
    const csrf = crypto.randomBytes(16).toString("hex");
    const token = jwt.sign({ userId: user._id.toString(), csrf }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, csrfToken: csrf, user: { email: user.email, name: user.name }, profile });
  }
  if (!existing) return res.status(400).json({ error: "Invalid password" });
  const ok = await bcrypt.compare(password, existing.passwordHash || "");
  if (!ok) return res.status(400).json({ error: "Invalid password" });
  const profile = await UserProfile.findOne({ userId: existing._id });
  const csrf = crypto.randomBytes(16).toString("hex");
  const token = jwt.sign({ userId: existing._id.toString(), csrf }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, csrfToken: csrf, user: { email: existing.email, name: existing.name }, profile });
}

export async function anonymous(req, res) {
  const user = await User.create({ isAnonymous: true, name: "Guest" });
  const profile = await UserProfile.create({ userId: user._id, role: "customer", isActive: true, permissions: permissionsForRole("customer") });
  const csrf = crypto.randomBytes(16).toString("hex");
  const token = jwt.sign({ userId: user._id.toString(), csrf }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, csrfToken: csrf, user: { name: user.name }, profile });
}