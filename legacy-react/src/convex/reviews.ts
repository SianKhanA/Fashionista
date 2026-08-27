import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authz";

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
          userImage: user?.imageUrl ?? user?.image,
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
    const user = await requireUser(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product || !product.active) throw new Error("Product is unavailable");
    if (!Number.isSafeInteger(args.rating) || args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    const title = args.title.trim();
    const comment = args.comment.trim();
    if (title.length < 2 || title.length > 120) throw new Error("Invalid review title");
    if (comment.length < 10 || comment.length > 2000) throw new Error("Invalid review text");

    // Check if user already reviewed this product
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .unique();
    if (existing) throw new Error("You have already reviewed this product");

    // Check if user purchased this product
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const hasPurchased = orders.some((order) =>
      order.status !== "cancelled" &&
      order.paymentStatus !== "failed" &&
      order.items.some((item) => item.productId === args.productId)
    );

    await ctx.db.insert("reviews", {
      userId: user._id,
      productId: args.productId,
      rating: args.rating,
      title,
      comment,
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
