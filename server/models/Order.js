import { mongoose } from "../config/db.js";

const schema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  orderNumber: { type: String, index: true },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    quantity: Number,
    size: String,
    unitPrice: Number,
    totalPrice: Number,
    specialInstructions: String,
  }],
  subtotal: Number,
  tax: Number,
  discount: Number,
  totalAmount: Number,
  orderType: String,
  status: { type: String, index: true, default: "pending" },
  paymentStatus: String,
  paymentMethod: String,
  customerNotes: String,
  estimatedReadyTime: Number,
  deliveryAddress: {
    street: String,
    city: String,
    zipCode: String,
    phone: String,
  },
  promoCode: String,
  loyaltyPointsUsed: Number,
  loyaltyPointsEarned: Number,
  assignedBarista: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Order", schema);