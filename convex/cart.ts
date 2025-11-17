import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Add item to cart
export const addToCart = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    quantity: v.number(),
    size: v.string(),
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    // Check if item already exists in cart with same size
    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("menuItemId"), args.menuItemId),
          q.eq(q.field("size"), args.size)
        )
      )
      .first();

    if (existingItem) {
      // Update quantity
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
        specialInstructions: args.specialInstructions || existingItem.specialInstructions,
      });
      return existingItem._id;
    } else {
      // Add new item
      return await ctx.db.insert("cartItems", {
        userId,
        menuItemId: args.menuItemId,
        quantity: args.quantity,
        size: args.size,
        specialInstructions: args.specialInstructions,
      });
    }
  },
});

// Get user's cart items with menu item details
export const getCartItems = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get menu item details for each cart item
    const cartWithDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        const menuItem = await ctx.db.get(cartItem.menuItemId);
        return {
          ...cartItem,
          menuItem: menuItem!,
        };
      })
    );

    return cartWithDetails;
  },
});

// Update cart item quantity
export const updateCartItemQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Cart item not found");
    }

    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
    } else {
      await ctx.db.patch(args.cartItemId, {
        quantity: args.quantity,
      });
    }
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Cart item not found");
    }

    await ctx.db.delete(args.cartItemId);
  },
});

// Clear entire cart
export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
  },
});

// Get cart item count
export const getCartItemCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return cartItems.reduce((total, item) => total + item.quantity, 0);
  },
});
