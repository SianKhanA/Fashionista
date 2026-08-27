import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUser } from "./authz";

const MAX_ITEM_QUANTITY = 20;

function assertQuantity(quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
    throw new Error(`Quantity must be between 1 and ${MAX_ITEM_QUANTITY}`);
  }
}

export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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

export const getCartCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
});

export const addItem = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    selectedSize: v.string(),
    selectedColor: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    assertQuantity(args.quantity);

    const product = await ctx.db.get(args.productId);
    if (!product || !product.active) throw new Error("Product is unavailable");
    if (!product.sizes.includes(args.selectedSize)) throw new Error("Invalid size");
    if (!product.colors.some((color) => color.name === args.selectedColor)) {
      throw new Error("Invalid color");
    }
    if (product.inventory < args.quantity) throw new Error("Insufficient inventory");

    // Check if item already exists in cart
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user_variant", (q) =>
        q
          .eq("userId", user._id)
          .eq("productId", args.productId)
          .eq("selectedSize", args.selectedSize)
          .eq("selectedColor", args.selectedColor)
      )
      .unique();

    if (existing) {
      const newQty = existing.quantity + args.quantity;
      assertQuantity(newQty);
      if (product.inventory < newQty) throw new Error("Insufficient inventory");
      await ctx.db.patch(existing._id, { quantity: newQty });
      return existing._id;
    }

    return await ctx.db.insert("cartItems", {
      userId: user._id,
      productId: args.productId,
      quantity: args.quantity,
      selectedSize: args.selectedSize,
      selectedColor: args.selectedColor,
    });
  },
});

export const updateQuantity = mutation({
  args: { cartItemId: v.id("cartItems"), quantity: v.number() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (args.quantity <= 0) {
      const item = await ctx.db.get(args.cartItemId);
      if (!item || item.userId !== user._id) throw new Error("Cart item not found");
      await ctx.db.delete(item._id);
      return;
    }
    assertQuantity(args.quantity);

    const item = await ctx.db.get(args.cartItemId);
    if (!item || item.userId !== user._id) throw new Error("Cart item not found");

    const product = await ctx.db.get(item.productId);
    if (!product || product.inventory < args.quantity) {
      throw new Error("Insufficient inventory");
    }

    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
  },
});

export const removeItem = mutation({
  args: { cartItemId: v.id("cartItems") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const item = await ctx.db.get(args.cartItemId);
    if (!item || item.userId !== user._id) throw new Error("Cart item not found");
    await ctx.db.delete(item._id);
  },
});

export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});
