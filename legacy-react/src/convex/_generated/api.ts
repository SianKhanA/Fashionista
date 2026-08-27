import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import { anyApi } from "convex/server";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as orders from "../orders.js";
import type * as newsletter from "../newsletter.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as support from "../support.js";
import type * as users from "../users.js";
import type * as wishlist from "../wishlist.js";

const fullApi: ApiFromModules<{
  auth: typeof auth;
  cart: typeof cart;
  categories: typeof categories;
  orders: typeof orders;
  newsletter: typeof newsletter;
  payments: typeof payments;
  products: typeof products;
  reviews: typeof reviews;
  seed: typeof seed;
  support: typeof support;
  users: typeof users;
  wishlist: typeof wishlist;
}> = anyApi as never;

export const api: FilterApi<typeof fullApi, FunctionReference<any, "public">> = anyApi as never;
export const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">> = anyApi as never;
