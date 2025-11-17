import { mongoose } from "../config/db.js";

const schema = new mongoose.Schema({
  code: { type: String, unique: true },
  description: String,
  discountType: String,
  discountValue: Number,
  minOrderAmount: Number,
  maxDiscount: Number,
  usageLimit: Number,
  validFrom: Number,
  validUntil: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("PromoCode", schema);