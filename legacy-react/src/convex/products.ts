import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authz";

const MAX_PAGE_SIZE = 48;
const MAX_CATALOG_SCAN = 1000;

export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    sizes: v.optional(v.array(v.string())),
    sort: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.search && args.search.trim().length > 100) throw new Error("Search is too long");
    if (args.sizes && args.sizes.length > 10) throw new Error("Too many size filters");
    if (args.minPrice !== undefined && (!Number.isFinite(args.minPrice) || args.minPrice < 0)) throw new Error("Invalid minimum price");
    if (args.maxPrice !== undefined && (!Number.isFinite(args.maxPrice) || args.maxPrice < 0)) throw new Error("Invalid maximum price");
    const limit = Math.min(Math.max(Math.floor(args.limit ?? 12), 1), MAX_PAGE_SIZE);
    const offset = Math.min(Math.max(Math.floor(args.offset ?? 0), 0), MAX_CATALOG_SCAN);

    const allProducts = args.categoryId
      ? await ctx.db
          .query("products")
          .withIndex("by_category_active", (q) =>
            q.eq("categoryId", args.categoryId!).eq("active", true)
          )
          .take(MAX_CATALOG_SCAN)
      : args.featured
        ? await ctx.db
            .query("products")
            .withIndex("by_featured_active", (q) =>
              q.eq("featured", true).eq("active", true)
            )
            .take(MAX_CATALOG_SCAN)
        : await ctx.db
            .query("products")
            .withIndex("by_active", (q) => q.eq("active", true))
            .take(MAX_CATALOG_SCAN);

    // Apply filters
    let filtered = allProducts.filter((p) => p.active);

    if (args.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= args.maxPrice!);
    }
    if (args.sizes && args.sizes.length > 0) {
      filtered = filtered.filter((p) =>
        args.sizes!.some((s) => p.sizes.includes(s))
      );
    }
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    switch (args.sort) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating":
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      default:
        filtered.sort((a, b) => b._creationTime - a._creationTime);
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      products: paginated,
      total,
      hasMore: offset + limit < total,
      truncated: allProducts.length === MAX_CATALOG_SCAN,
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return product?.active ? product : null;
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    return product?.active ? product : null;
  },
});

export const getRelated = query({
  args: { productId: v.id("products"), categoryId: v.id("categories"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    return products
      .filter((p) => p._id !== args.productId && p.active)
      .slice(0, args.limit ?? 4);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    categoryId: v.id("categories"),
    images: v.array(v.string()),
    sizes: v.array(v.string()),
    colors: v.array(v.object({ name: v.string(), hex: v.string() })),
    materials: v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    tags: v.array(v.string()),
    inventory: v.number(),
    sku: v.string(),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!Number.isSafeInteger(args.price) || args.price < 0) throw new Error("Invalid price");
    if (!Number.isSafeInteger(args.inventory) || args.inventory < 0) {
      throw new Error("Invalid inventory");
    }
    if (args.images.length === 0 || args.sizes.length === 0 || args.colors.length === 0) {
      throw new Error("Products require images, sizes, and colors");
    }
    return await ctx.db.insert("products", {
      ...args,
      active: true,
      averageRating: 0,
      reviewCount: 0,
      salesCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    inventory: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    if (updates.price !== undefined && (!Number.isSafeInteger(updates.price) || updates.price < 0)) {
      throw new Error("Invalid price");
    }
    if (
      updates.inventory !== undefined &&
      (!Number.isSafeInteger(updates.inventory) || updates.inventory < 0)
    ) {
      throw new Error("Invalid inventory");
    }
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});
