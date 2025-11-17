import { mongoose } from "../config/db.js";

const schema = new mongoose.Schema({
  name: String,
  description: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
  basePrice: Number,
  imageUrl: String,
  ingredients: [String],
  isAvailable: { type: Boolean, default: true },
  isVegetarian: Boolean,
  isVegan: Boolean,
  calories: Number,
  preparationTime: Number,
  variants: [{ size: String, priceModifier: Number }],
}, { timestamps: true });

export default mongoose.model("MenuItem", schema);