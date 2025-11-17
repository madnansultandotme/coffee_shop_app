/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as http from "../http.js";
import type * as loyalty from "../loyalty.js";
import type * as menu from "../menu.js";
import type * as orders from "../orders.js";
import type * as reviews from "../reviews.js";
import type * as router from "../router.js";
import type * as sampleData from "../sampleData.js";
import type * as setupTestAccounts from "../setupTestAccounts.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  cart: typeof cart;
  http: typeof http;
  loyalty: typeof loyalty;
  menu: typeof menu;
  orders: typeof orders;
  reviews: typeof reviews;
  router: typeof router;
  sampleData: typeof sampleData;
  setupTestAccounts: typeof setupTestAccounts;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
