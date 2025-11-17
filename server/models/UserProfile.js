import { mongoose } from "../config/db.js";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  role: { type: String, default: "customer" },
  firstName: String,
  lastName: String,
  phone: String,
  isActive: { type: Boolean, default: true },
  hireDate: Date,
  permissions: [String],
}, { timestamps: true });

export default mongoose.model("UserProfile", schema);