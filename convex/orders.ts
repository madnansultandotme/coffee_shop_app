import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CF${timestamp}${random}`;
}

// Create order from cart
export const createOrder = mutation({
  args: {
    orderType: v.union(v.literal("pickup"), v.literal("delivery")),
    paymentMethod: v.string(),
    customerNotes: v.optional(v.string()),
    deliveryAddress: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      zipCode: v.string(),
      phone: v.string(),
    })),
    promoCode: v.optional(v.string()),
    loyaltyPointsUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    // Get cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const menuItem = await ctx.db.get(cartItem.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        throw new Error(`Item ${menuItem?.name || 'Unknown'} is not available`);
      }

      // Find variant price
      const variant = menuItem.variants.find(v => v.size === cartItem.size);
      const unitPrice = menuItem.basePrice + (variant?.priceModifier || 0);
      const totalPrice = unitPrice * cartItem.quantity;

      orderItems.push({
        menuItemId: cartItem.menuItemId,
        quantity: cartItem.quantity,
        size: cartItem.size,
        unitPrice,
        totalPrice,
        specialInstructions: cartItem.specialInstructions,
      });

      subtotal += totalPrice;
    }

    // Apply promo code discount
    let discount = 0;
    if (args.promoCode) {
      const promo = await ctx.db
        .query("promoCodes")
        .withIndex("by_code", (q) => q.eq("code", args.promoCode!))
        .first();

      if (promo && promo.isActive && 
          promo.validFrom <= Date.now() && 
          promo.validUntil >= Date.now() &&
          (!promo.minOrderAmount || subtotal >= promo.minOrderAmount) &&
          (!promo.usageLimit || promo.usedCount < promo.usageLimit)) {
        
        if (promo.discountType === "percentage") {
          discount = subtotal * (promo.discountValue / 100);
          if (promo.maxDiscount) {
            discount = Math.min(discount, promo.maxDiscount);
          }
        } else {
          discount = promo.discountValue;
        }

        // Update promo code usage
        await ctx.db.patch(promo._id, {
          usedCount: promo.usedCount + 1,
        });
      }
    }

    // Apply loyalty points discount
    const loyaltyDiscount = (args.loyaltyPointsUsed || 0) * 0.01; // 1 point = $0.01
    discount += loyaltyDiscount;

    const tax = (subtotal - discount) * 0.08; // 8% tax
    const totalAmount = subtotal - discount + tax;

    // Calculate loyalty points earned (1 point per dollar spent)
    const loyaltyPointsEarned = Math.floor(totalAmount);

    // Create order
    const orderId = await ctx.db.insert("orders", {
      customerId: userId,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      orderType: args.orderType,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: args.paymentMethod,
      customerNotes: args.customerNotes,
      deliveryAddress: args.deliveryAddress,
      promoCode: args.promoCode,
      loyaltyPointsUsed: args.loyaltyPointsUsed,
      loyaltyPointsEarned,
      estimatedReadyTime: Date.now() + (20 * 60 * 1000), // 20 minutes from now
    });

    // Add loyalty points transaction for earned points
    if (loyaltyPointsEarned > 0) {
      await ctx.db.insert("loyaltyTransactions", {
        userId,
        orderId,
        points: loyaltyPointsEarned,
        type: "earned",
        description: `Points earned from order ${generateOrderNumber()}`,
      });
    }

    // Deduct loyalty points if used
    if (args.loyaltyPointsUsed && args.loyaltyPointsUsed > 0) {
      await ctx.db.insert("loyaltyTransactions", {
        userId,
        orderId,
        points: -args.loyaltyPointsUsed,
        type: "redeemed",
        description: `Points redeemed for order ${generateOrderNumber()}`,
      });
    }

    // Clear cart
    for (const cartItem of cartItems) {
      await ctx.db.delete(cartItem._id);
    }

    return orderId;
  },
});

// Get user's orders
export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", userId))
      .order("desc")
      .collect();
  },
});

// Get single order
export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const order = await ctx.db.get(args.orderId);
    if (!order || order.customerId !== userId) {
      throw new Error("Order not found");
    }

    return order;
  },
});

// Admin: Get all orders
export const getAllOrders = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    
    return await ctx.db.query("orders").order("desc").collect();
  },
});

// Admin: Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    estimatedReadyTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updateData: any = { status: args.status };
    
    if (args.estimatedReadyTime) {
      updateData.estimatedReadyTime = args.estimatedReadyTime;
    }

    await ctx.db.patch(args.orderId, updateData);
  },
});

// Reorder previous order
export const reorder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const originalOrder = await ctx.db.get(args.orderId);
    if (!originalOrder || originalOrder.customerId !== userId) {
      throw new Error("Order not found");
    }

    // Clear current cart
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    // Add items from original order to cart
    for (const item of originalOrder.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (menuItem && menuItem.isAvailable) {
        await ctx.db.insert("cartItems", {
          userId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          size: item.size,
          specialInstructions: item.specialInstructions,
        });
      }
    }
  },
});
