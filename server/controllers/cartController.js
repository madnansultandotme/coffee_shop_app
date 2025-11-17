import CartItem from "../models/CartItem.js";
import MenuItem from "../models/MenuItem.js";

export async function add(req, res) {
  const { menuItemId, quantity, size, specialInstructions } = req.body;
  const existing = await CartItem.findOne({ userId: req.userId, menuItemId, size });
  if (existing) {
    existing.quantity = existing.quantity + quantity;
    if (specialInstructions) existing.specialInstructions = specialInstructions;
    await existing.save();
    return res.json({ id: existing._id });
  }
  const created = await CartItem.create({ userId: req.userId, menuItemId, quantity, size, specialInstructions });
  return res.json({ id: created._id });
}

export async function list(req, res) {
  const rows = await CartItem.find({ userId: req.userId });
  const items = await Promise.all(rows.map(async r => {
    const menuItem = await MenuItem.findById(r.menuItemId);
    return { _id: r._id, menuItem, quantity: r.quantity, size: r.size, specialInstructions: r.specialInstructions };
  }));
  return res.json(items);
}

export async function update(req, res) {
  const { quantity } = req.body;
  const row = await CartItem.findById(req.params.id);
  if (!row || row.userId.toString() !== req.userId) return res.status(404).json({ error: "Not found" });
  if (quantity <= 0) {
    await CartItem.findByIdAndDelete(row._id);
    return res.json({ ok: true });
  }
  row.quantity = quantity;
  await row.save();
  return res.json({ ok: true });
}

export async function remove(req, res) {
  const row = await CartItem.findById(req.params.id);
  if (!row || row.userId.toString() !== req.userId) return res.status(404).json({ error: "Not found" });
  await CartItem.findByIdAndDelete(row._id);
  return res.json({ ok: true });
}

export async function clear(req, res) {
  await CartItem.deleteMany({ userId: req.userId });
  return res.json({ ok: true });
}