import { mongoose } from "../config/db.js";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  points: Number,
  type: String,
  description: String,
}, { timestamps: true });

export default mongoose.model("LoyaltyTransaction", schema);