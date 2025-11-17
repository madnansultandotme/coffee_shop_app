import Category from "../models/Category.js";
import MenuItem from "../models/MenuItem.js";

export async function categories(req, res) {
  const rows = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  return res.json(rows);
}

export async function items(req, res) {
  const { categoryId } = req.query;
  if (categoryId) {
    const rows = await MenuItem.find({ categoryId, isAvailable: true });
    return res.json(rows);
  }
  const rows = await MenuItem.find({ isAvailable: true });
  return res.json(rows);
}

export async function search(req, res) {
  const term = (req.query.term || "").toString().toLowerCase();
  const rows = await MenuItem.find({ isAvailable: true });
  const filtered = rows.filter(i =>
    i.name.toLowerCase().includes(term) ||
    i.description.toLowerCase().includes(term) ||
    (i.ingredients || []).some(g => g.toLowerCase().includes(term))
  );
  return res.json(filtered);
}

export async function adminCategories(req, res) {
  const rows = await Category.find().sort({ sortOrder: 1, name: 1 });
  return res.json(rows);
}

export async function adminItems(req, res) {
  const rows = await MenuItem.find();
  return res.json(rows);
}

export async function updateAvailability(req, res) {
  const { isAvailable } = req.body;
  await MenuItem.findByIdAndUpdate(req.params.id, { isAvailable });
  return res.json({ ok: true });
}