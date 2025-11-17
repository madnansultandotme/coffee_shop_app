import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";

export async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.json(null);
  const profile = await UserProfile.findOne({ userId: user._id });
  return res.json({ email: user.email, name: user.name, profile });
}