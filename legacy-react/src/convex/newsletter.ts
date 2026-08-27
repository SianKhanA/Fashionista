import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string(), website: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.website) return { subscribed: true };
    const email = args.email.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address");
    }
    const existing = await ctx.db.query("newsletterSubscribers").withIndex("by_email", (q) => q.eq("email", email)).unique();
    if (existing) {
      if (!existing.active) await ctx.db.patch(existing._id, { active: true, consentedAt: Date.now() });
      return { subscribed: true };
    }
    await ctx.db.insert("newsletterSubscribers", { email, active: true, consentedAt: Date.now() });
    return { subscribed: true };
  },
});
