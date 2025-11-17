import { mongoose } from "../config/db.js";

const schema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Category", schema);