import { mongoose } from "../config/db.js";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
  quantity: Number,
  size: String,
  specialInstructions: String,
}, { timestamps: true });

export default mongoose.model("CartItem", schema);