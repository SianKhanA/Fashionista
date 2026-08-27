import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Convex Auth user records extended with storefront profile data.
  users: defineTable({
    ...authTables.users.validator.fields,
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("customer"), v.literal("admin"))),
    address: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
        country: v.string(),
      })
    ),
    phone: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // Product categories
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    sortOrder: v.number(),
    active: v.boolean(),
  }).index("by_slug", ["slug"])
    .index("by_sort", ["sortOrder"]),

  // Products
  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(), // in cents
    compareAtPrice: v.optional(v.number()), // original price for sale items
    categoryId: v.id("categories"),
    images: v.array(v.string()),
    sizes: v.array(v.string()),
    colors: v.array(
      v.object({
        name: v.string(),
        hex: v.string(),
      })
    ),
    materials: v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    tags: v.array(v.string()),
    inventory: v.number(),
    sku: v.string(),
    featured: v.boolean(),
    active: v.boolean(),
    averageRating: v.number(),
    reviewCount: v.number(),
    salesCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_category_active", ["categoryId", "active"])
    .index("by_featured", ["featured"])
    .index("by_featured_active", ["featured", "active"])
    .index("by_price", ["price"])
    .index("by_active", ["active"])
    .index("by_sales", ["salesCount"])
    .index("by_rating", ["averageRating"]),

  // Shopping cart items
  cartItems: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
    selectedSize: v.string(),
    selectedColor: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"])
    .index("by_user_variant", [
      "userId",
      "productId",
      "selectedSize",
      "selectedColor",
    ]),

  // Orders
  orders: defineTable({
    userId: v.id("users"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        size: v.string(),
        color: v.string(),
        imageUrl: v.optional(v.string()),
      })
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    total: v.number(),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
    // Kept backward-compatible while older pre-launch orders are migrated.
    paymentMethod: v.string(),
    paymentStatus: v.optional(v.union(
      v.literal("awaiting_payment"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    )),
    paymentIntentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
    currency: v.optional(v.string()),
    subtotal: v.optional(v.number()),
    shippingCost: v.optional(v.number()),
    discount: v.optional(v.number()),
    couponCode: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Product reviews
  reviews: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    rating: v.number(),
    title: v.string(),
    comment: v.string(),
    helpful: v.number(),
    verified: v.boolean(),
  })
    .index("by_product", ["productId"])
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"])
    .index("by_rating", ["rating"]),

  // Wishlist items
  wishlists: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
  })
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"]),

  // Coupons / discount codes
  coupons: defineTable({
    code: v.string(),
    type: v.union(
      v.literal("percentage"),
      v.literal("fixed"),
      v.literal("free_shipping")
    ),
    value: v.number(),
    minOrder: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    usedCount: v.number(),
    active: v.boolean(),
    expiresAt: v.optional(v.number()),
  }).index("by_code", ["code"]),

  newsletterSubscribers: defineTable({
    email: v.string(),
    active: v.boolean(),
    consentedAt: v.number(),
  }).index("by_email", ["email"]),

  customerMessages: defineTable({
    name: v.string(),
    email: v.string(),
    orderNumber: v.optional(v.string()),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("resolved")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"]),
});
