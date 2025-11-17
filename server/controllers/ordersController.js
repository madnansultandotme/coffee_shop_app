import CartItem from "../models/CartItem.js";
import MenuItem from "../models/MenuItem.js";
import PromoCode from "../models/PromoCode.js";
import Order from "../models/Order.js";
import LoyaltyTransaction from "../models/LoyaltyTransaction.js";
import { generateOrderNumber } from "../utils/order.js";

export async function listOwn(req, res) {
  const rows = await Order.find({ customerId: req.userId }).sort({ createdAt: -1 });
  return res.json(rows.map(o => ({ ...o.toObject(), _creationTime: o.createdAt.getTime() })));
}

export async function reorder(req, res) {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order || order.customerId.toString() !== req.userId) return res.status(404).json({ error: "Not found" });
  await CartItem.deleteMany({ userId: req.userId });
  for (const item of order.items) {
    const mi = await MenuItem.findById(item.menuItemId);
    if (mi && mi.isAvailable) {
      await CartItem.create({ userId: req.userId, menuItemId: item.menuItemId, quantity: item.quantity, size: item.size, specialInstructions: item.specialInstructions });
    }
  }
  return res.json({ ok: true });
}

export async function create(req, res) {
  const { orderType, paymentMethod, customerNotes, deliveryAddress, promoCode, loyaltyPointsUsed } = req.body;
  const cartRows = await CartItem.find({ userId: req.userId });
  if (cartRows.length === 0) return res.status(400).json({ error: "Cart is empty" });
  let subtotal = 0;
  const items = [];
  for (const r of cartRows) {
    const mi = await MenuItem.findById(r.menuItemId);
    if (!mi || !mi.isAvailable) return res.status(400).json({ error: "Item not available" });
    const variant = (mi.variants || []).find(v => v.size === r.size);
    const unitPrice = mi.basePrice + (variant?.priceModifier || 0);
    const totalPrice = unitPrice * r.quantity;
    items.push({ menuItemId: r.menuItemId, quantity: r.quantity, size: r.size, unitPrice, totalPrice, specialInstructions: r.specialInstructions });
    subtotal += totalPrice;
  }
  let discount = 0;
  if (promoCode) {
    const p = await PromoCode.findOne({ code: promoCode });
    const now = Date.now();
    if (p && p.isActive && (!p.minOrderAmount || subtotal >= p.minOrderAmount) && (!p.validFrom || p.validFrom <= now) && (!p.validUntil || p.validUntil >= now) && (!p.usageLimit || p.usedCount < p.usageLimit)) {
      if (p.discountType === "percentage") {
        discount = subtotal * (p.discountValue / 100);
        if (p.maxDiscount) discount = Math.min(discount, p.maxDiscount);
      } else {
        discount = p.discountValue;
      }
      p.usedCount = (p.usedCount || 0) + 1;
      await p.save();
    }
  }
  const loyaltyDiscount = (loyaltyPointsUsed || 0) * 0.01;
  discount += loyaltyDiscount;
  const tax = (subtotal - discount) * 0.08;
  const totalAmount = subtotal - discount + tax;
  const loyaltyPointsEarned = Math.floor(totalAmount);
  const created = await Order.create({
    customerId: req.userId,
    orderNumber: generateOrderNumber(),
    items,
    subtotal,
    tax,
    discount,
    totalAmount,
    orderType,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod,
    customerNotes,
    deliveryAddress,
    promoCode,
    loyaltyPointsUsed,
    loyaltyPointsEarned,
    estimatedReadyTime: Date.now() + 20 * 60 * 1000,
  });
  if (loyaltyPointsEarned > 0) {
    await LoyaltyTransaction.create({ userId: req.userId, orderId: created._id, points: loyaltyPointsEarned, type: "earned", description: `Points earned from order ${created.orderNumber}` });
  }
  if (loyaltyPointsUsed && loyaltyPointsUsed > 0) {
    await LoyaltyTransaction.create({ userId: req.userId, orderId: created._id, points: -loyaltyPointsUsed, type: "redeemed", description: `Points redeemed for order ${created.orderNumber}` });
  }
  await CartItem.deleteMany({ userId: req.userId });
  return res.json({ id: created._id });
}

export async function listAll(req, res) {
  const { status } = req.query;
  if (status) {
    const rows = await Order.find({ status }).sort({ createdAt: -1 });
    return res.json(rows.map(o => ({ ...o.toObject(), _creationTime: o.createdAt.getTime() })));
  }
  const rows = await Order.find().sort({ createdAt: -1 });
  return res.json(rows.map(o => ({ ...o.toObject(), _creationTime: o.createdAt.getTime() })));
}

export async function updateStatus(req, res) {
  const { status, estimatedReadyTime } = req.body;
  const update = { status };
  if (estimatedReadyTime) update.estimatedReadyTime = estimatedReadyTime;
  await Order.findByIdAndUpdate(req.params.id, update);
  return res.json({ ok: true });
}