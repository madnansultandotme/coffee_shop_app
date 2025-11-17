import { mongoose } from "../config/db.js";

const schema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  name: String,
  passwordHash: String,
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("User", schema);