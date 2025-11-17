import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's loyalty points summary
export const getUserLoyaltyPoints = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const transactions = await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalPoints = transactions.reduce((sum, transaction) => sum + transaction.points, 0);
    const totalEarned = transactions
      .filter(t => t.points > 0)
      .reduce((sum, transaction) => sum + transaction.points, 0);
    const totalRedeemed = Math.abs(transactions
      .filter(t => t.points < 0)
      .reduce((sum, transaction) => sum + transaction.points, 0));

    return {
      totalPoints,
      totalEarned,
      totalRedeemed,
    };
  },
});

// Get user's loyalty transaction history
export const getUserLoyaltyTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
