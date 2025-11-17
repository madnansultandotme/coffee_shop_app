import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current user's profile
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return {
      ...user,
      profile,
    };
  },
});

// Create or update user profile
export const createOrUpdateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("customer"),
      v.literal("barista"),
      v.literal("manager"),
      v.literal("admin")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const profileData = {
      userId,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      role: args.role || "customer",
      isActive: true,
      permissions: getDefaultPermissions(args.role || "customer"),
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    } else {
      return await ctx.db.insert("userProfiles", profileData);
    }
  },
});

// Check user permissions
export const hasPermission = query({
  args: { permission: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || !profile.isActive) return false;

    return profile.permissions.includes(args.permission) || 
           profile.permissions.includes("admin:all");
  },
});

// Get all staff members (admin/manager only)
export const getAllStaff = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentUserProfile || 
        (!currentUserProfile.permissions.includes("admin:all") && 
         !currentUserProfile.permissions.includes("staff:view"))) {
      return [];
    }

    const allProfiles = await ctx.db
      .query("userProfiles")
      .collect();
    
    const staffProfiles = allProfiles.filter(profile => profile.role !== "customer");

    const staffWithUsers = await Promise.all(
      staffProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          user,
        };
      })
    );

    return staffWithUsers;
  },
});

// Admin: Update user role and permissions
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("customer"),
      v.literal("barista"),
      v.literal("manager"),
      v.literal("admin")
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Must be logged in");

    const currentUserProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .first();

    if (!currentUserProfile || 
        !currentUserProfile.permissions.includes("admin:all")) {
      throw new Error("Insufficient permissions");
    }

    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const updateData = {
      role: args.role,
      permissions: getDefaultPermissions(args.role),
      isActive: args.isActive ?? true,
    };

    if (targetProfile) {
      await ctx.db.patch(targetProfile._id, updateData);
    } else {
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        ...updateData,
      });
    }
  },
});

// Initialize test accounts
export const initializeTestAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    // This would typically be called once during setup
    // In a real app, you'd create these accounts through your auth system
    
    // Check if test accounts already exist
    const existingProfiles = await ctx.db.query("userProfiles").collect();
    if (existingProfiles.length > 0) {
      return "Test accounts already initialized";
    }

    // Note: In a real implementation, you'd need to create actual user accounts
    // through your authentication system first, then create profiles for them
    
    return "Test accounts would be created through the authentication system";
  },
});

function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case "admin":
      return [
        "admin:all",
        "orders:manage",
        "menu:manage",
        "staff:manage",
        "inventory:manage",
        "reports:view",
        "settings:manage"
      ];
    case "manager":
      return [
        "orders:manage",
        "menu:manage",
        "staff:view",
        "inventory:manage",
        "reports:view"
      ];
    case "barista":
      return [
        "orders:view",
        "orders:update_status",
        "inventory:view"
      ];
    case "customer":
    default:
      return [
        "orders:create",
        "orders:view_own",
        "reviews:create"
      ];
  }
}
