import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

// Get menu items by category
export const getMenuItemsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect();
  },
});

// Get all available menu items
export const getAllMenuItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_availability", (q) => q.eq("isAvailable", true))
      .collect();
  },
});

// Search menu items
export const searchMenuItems = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allItems = await ctx.db
      .query("menuItems")
      .withIndex("by_availability", (q) => q.eq("isAvailable", true))
      .collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    return allItems.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchLower)
      )
    );
  },
});

// Get single menu item
export const getMenuItem = query({
  args: { itemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.itemId);
  },
});

// Admin: Create category
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", {
      ...args,
      isActive: true,
    });
  },
});

// Admin: Create menu item
export const createMenuItem = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    basePrice: v.number(),
    imageUrl: v.optional(v.string()),
    ingredients: v.array(v.string()),
    isVegetarian: v.optional(v.boolean()),
    isVegan: v.optional(v.boolean()),
    calories: v.optional(v.number()),
    preparationTime: v.number(),
    variants: v.array(v.object({
      size: v.string(),
      priceModifier: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      ...args,
      isAvailable: true,
    });
  },
});

// Admin: Update menu item availability
export const updateMenuItemAvailability = mutation({
  args: {
    itemId: v.id("menuItems"),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, {
      isAvailable: args.isAvailable,
    });
  },
});

// Admin: Get all categories (including inactive)
export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").collect();
  },
});

// Admin: Get all menu items (including unavailable)
export const getAllMenuItemsAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("menuItems").collect();
  },
});
