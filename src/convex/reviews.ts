import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getProductReviews = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name || "Anonymous",
          userImage: user?.imageUrl,
        };
      })
    );

    return reviewsWithUsers;
  },
});

export const addReview = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    title: v.string(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) throw new Error("User not found");

    // Check if user already reviewed this product
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const alreadyReviewed = existing.some(
      (r) => r.productId === args.productId
    );
    if (alreadyReviewed) throw new Error("You have already reviewed this product");

    // Check if user purchased this product
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const hasPurchased = orders.some((order) =>
      order.items.some((item) => item.productId === args.productId)
    );

    await ctx.db.insert("reviews", {
      userId: user._id,
      productId: args.productId,
      rating: Math.max(1, Math.min(5, args.rating)),
      title: args.title,
      comment: args.comment,
      helpful: 0,
      verified: hasPurchased,
    });

    // Update product average rating
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ctx.db.patch(args.productId, {
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    return "Review added";
  },
});
