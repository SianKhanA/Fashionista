import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type DatabaseContext = Pick<QueryCtx | MutationCtx, "auth" | "db">;

export async function requireUser(ctx: DatabaseContext) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Authentication required");

  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User account not found");
  return user;
}

export async function requireAdmin(ctx: DatabaseContext) {
  const user = await requireUser(ctx);
  if (user.role !== "admin") throw new Error("Administrator access required");
  return user;
}
