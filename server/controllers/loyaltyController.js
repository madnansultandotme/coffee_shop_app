import LoyaltyTransaction from "../models/LoyaltyTransaction.js";

export async function summary(req, res) {
  const txs = await LoyaltyTransaction.find({ userId: req.userId });
  const totalPoints = txs.reduce((s, t) => s + t.points, 0);
  const totalEarned = txs.filter(t => t.points > 0).reduce((s, t) => s + t.points, 0);
  const totalRedeemed = Math.abs(txs.filter(t => t.points < 0).reduce((s, t) => s + t.points, 0));
  return res.json({ totalPoints, totalEarned, totalRedeemed });
}

export async function transactions(req, res) {
  const txs = await LoyaltyTransaction.find({ userId: req.userId }).sort({ createdAt: -1 });
  return res.json(txs.map(t => ({ ...t.toObject(), _creationTime: t.createdAt.getTime() })));
}