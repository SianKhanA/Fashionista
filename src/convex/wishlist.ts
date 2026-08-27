import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getWishlist = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) return [];

    const items = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return { ...item, product };
      })
    );

    return itemsWithProducts.filter((item) => item.product !== null);
  },
});

export const isInWishlist = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) return false;

    const item = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .unique();

    return item !== null;
  },
});

export const toggleWishlist = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("wishlists", {
        userId: user._id,
        productId: args.productId,
      });
      return true;
    }
  },
});
