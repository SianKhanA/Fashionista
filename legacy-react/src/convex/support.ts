import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authz";

export const sendMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    orderNumber: v.optional(v.string()),
    message: v.string(),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.website) return { received: true };
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();
    if (name.length < 2 || name.length > 80) throw new Error("Please enter your name");
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email");
    if (message.length < 20 || message.length > 3000) throw new Error("Your message must be between 20 and 3,000 characters");
    const recent = await ctx.db.query("customerMessages").withIndex("by_email", (q) => q.eq("email", email)).order("desc").first();
    if (recent && Date.now() - recent.createdAt < 60_000) throw new Error("Please wait a minute before sending another message");
    await ctx.db.insert("customerMessages", {
      name,
      email,
      orderNumber: args.orderNumber?.trim().slice(0, 80) || undefined,
      message,
      status: "new",
      createdAt: Date.now(),
    });
    return { received: true };
  },
});

export const listMessages = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("customerMessages").withIndex("by_status", (q) => q.eq("status", "new")).order("desc").take(200);
  },
});
