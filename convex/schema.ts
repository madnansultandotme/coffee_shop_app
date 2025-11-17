import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with roles
  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(
      v.literal("customer"),
      v.literal("barista"),
      v.literal("manager"),
      v.literal("admin")
    ),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    isActive: v.boolean(),
    hireDate: v.optional(v.number()),
    permissions: v.array(v.string()),
  }).index("by_user", ["userId"])
    .index("by_role", ["role"]),

  // Menu categories
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }),

  // Menu items
  menuItems: defineTable({
    name: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    basePrice: v.number(),
    imageUrl: v.optional(v.string()),
    ingredients: v.array(v.string()),
    isAvailable: v.boolean(),
    isVegetarian: v.optional(v.boolean()),
    isVegan: v.optional(v.boolean()),
    calories: v.optional(v.number()),
    preparationTime: v.number(), // in minutes
    variants: v.array(v.object({
      size: v.string(), // "small", "medium", "large"
      priceModifier: v.number(), // additional cost
    })),
  }).index("by_category", ["categoryId"])
    .index("by_availability", ["isAvailable"]),

  // Customer orders
  orders: defineTable({
    customerId: v.id("users"),
    orderNumber: v.string(),
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      quantity: v.number(),
      size: v.string(),
      unitPrice: v.number(),
      totalPrice: v.number(),
      specialInstructions: v.optional(v.string()),
    })),
    subtotal: v.number(),
    tax: v.number(),
    discount: v.number(),
    totalAmount: v.number(),
    orderType: v.union(v.literal("pickup"), v.literal("delivery")),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentMethod: v.optional(v.string()),
    customerNotes: v.optional(v.string()),
    estimatedReadyTime: v.optional(v.number()),
    deliveryAddress: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      zipCode: v.string(),
      phone: v.string(),
    })),
    promoCode: v.optional(v.string()),
    loyaltyPointsUsed: v.optional(v.number()),
    loyaltyPointsEarned: v.number(),
    assignedBarista: v.optional(v.id("users")),
  }).index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_order_number", ["orderNumber"])
    .index("by_barista", ["assignedBarista"]),

  // Loyalty points transactions
  loyaltyTransactions: defineTable({
    userId: v.id("users"),
    orderId: v.optional(v.id("orders")),
    points: v.number(), // positive for earned, negative for redeemed
    type: v.union(v.literal("earned"), v.literal("redeemed"), v.literal("bonus")),
    description: v.string(),
  }).index("by_user", ["userId"]),

  // Promotional codes
  promoCodes: defineTable({
    code: v.string(),
    description: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    validFrom: v.number(),
    validUntil: v.number(),
    usageLimit: v.optional(v.number()),
    usedCount: v.number(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
  }).index("by_code", ["code"]),

  // Reviews and ratings
  reviews: defineTable({
    customerId: v.id("users"),
    orderId: v.id("orders"),
    rating: v.number(), // 1-5
    comment: v.optional(v.string()),
    adminResponse: v.optional(v.string()),
    respondedBy: v.optional(v.id("users")),
  }).index("by_customer", ["customerId"])
    .index("by_order", ["orderId"]),

  // Cart items (for persistent cart)
  cartItems: defineTable({
    userId: v.id("users"),
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    size: v.string(),
    specialInstructions: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Store settings
  storeSettings: defineTable({
    key: v.string(),
    value: v.string(),
    description: v.optional(v.string()),
    updatedBy: v.optional(v.id("users")),
  }).index("by_key", ["key"]),

  // Staff schedules
  staffSchedules: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    startTime: v.string(), // HH:MM format
    endTime: v.string(), // HH:MM format
    isActive: v.boolean(),
    createdBy: v.id("users"),
  }).index("by_user_date", ["userId", "date"])
    .index("by_date", ["date"]),

  // Inventory items
  inventory: defineTable({
    name: v.string(),
    category: v.string(),
    currentStock: v.number(),
    minStock: v.number(),
    unit: v.string(), // "kg", "liters", "pieces", etc.
    supplier: v.optional(v.string()),
    lastRestocked: v.optional(v.number()),
    updatedBy: v.id("users"),
  }).index("by_category", ["category"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
