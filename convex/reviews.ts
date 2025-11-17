import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a review
export const createReview = mutation({
  args: {
    orderId: v.id("orders"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    // Verify the order belongs to the user and is completed
    const order = await ctx.db.get(args.orderId);
    if (!order || order.customerId !== userId || order.status !== "completed") {
      throw new Error("Invalid order for review");
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (existingReview) {
      throw new Error("Review already exists for this order");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    return await ctx.db.insert("reviews", {
      customerId: userId,
      orderId: args.orderId,
      rating: args.rating,
      comment: args.comment,
    });
  },
});

// Get reviews for a specific order
export const getOrderReview = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("reviews")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();
  },
});

// Get user's reviews
export const getUserReviews = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("reviews")
      .withIndex("by_customer", (q) => q.eq("customerId", userId))
      .order("desc")
      .collect();
  },
});

// Admin: Get all reviews
export const getAllReviews = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reviews").order("desc").collect();
  },
});

// Admin: Respond to review
export const respondToReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    // Check permissions (admin or manager)
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || 
        (!userProfile.permissions.includes("admin:all") && 
         !userProfile.permissions.includes("reviews:respond"))) {
      throw new Error("Insufficient permissions");
    }

    await ctx.db.patch(args.reviewId, {
      adminResponse: args.response,
      respondedBy: userId,
    });
  },
});
