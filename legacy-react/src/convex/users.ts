import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUser } from "./authz";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId ? await ctx.db.get(userId) : null;
  },
});

export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (!user.role) {
      await ctx.db.patch(user._id, { role: "customer" });
      return await ctx.db.get(user._id);
    }
    return user;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
        country: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 2 || name.length > 80) throw new Error("Invalid name");
      updates.name = name;
    }
    if (args.phone !== undefined) {
      const phone = args.phone.trim();
      if (phone.length > 30) throw new Error("Invalid phone number");
      updates.phone = phone || undefined;
    }
    if (args.address !== undefined) updates.address = args.address;

    await ctx.db.patch(user._id, updates);
    return await ctx.db.get(user._id);
  },
});
