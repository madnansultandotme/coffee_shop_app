import { useEffect, useState } from "react";

type Descriptor = { method: string; path: string };

const baseUrl = (import.meta.env.VITE_SERVER_URL as string) || "http://localhost:4000";

function authHeader(): Record<string, string> {
  const hdr: Record<string, string> = {};
  const t = localStorage.getItem("auth_token");
  if (t) hdr.Authorization = `Bearer ${t}`;
  const c = localStorage.getItem("csrf_token");
  if (c) hdr["x-csrf-token"] = c;
  return hdr;
}

export function useQuery<T = any>(descriptor: Descriptor, args?: any) {
  const [data, setData] = useState<T | undefined>(undefined);
  useEffect(() => {
    if (args === "skip") return;
    const url = new URL(`${baseUrl}${descriptor.path}`);
    if (descriptor.method === "GET" && args && typeof args === "object") {
      Object.entries(args).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, String(v)); });
    }
    fetch(url.toString(), { headers: authHeader() }).then(r => r.json()).then(setData).catch(() => setData(undefined));
  }, [JSON.stringify(args), descriptor.path, descriptor.method]);
  return data;
}

export function useMutation<R = any>(descriptor: Descriptor) {
  return async (body?: any): Promise<R> => {
    const opts: any = { method: descriptor.method, headers: authHeader() };
    if (descriptor.method !== "GET") {
      opts.headers["Content-Type"] = "application/json";
      opts.body = body ? JSON.stringify(body) : undefined;
    }
    const r = await fetch(`${baseUrl}${descriptor.path}`, opts);
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || "Request failed");
    }
    return r.json().catch(() => ({} as R));
  };
}

export const api = {
  users: {
    getCurrentUserProfile: { method: "GET", path: "/api/users/me" },
  },
  menu: {
    getCategories: { method: "GET", path: "/api/menu/categories" },
    getMenuItemsByCategory: { method: "GET", path: "/api/menu/items" },
    getAllMenuItems: { method: "GET", path: "/api/menu/items" },
    searchMenuItems: { method: "GET", path: "/api/menu/search" },
    getAllCategories: { method: "GET", path: "/api/admin/menu/categories" },
    getAllMenuItemsAdmin: { method: "GET", path: "/api/admin/menu/items" },
    updateMenuItemAvailability: { method: "PATCH", path: "/api/admin/menu/items/:id/availability" },
  },
  cart: {
    addToCart: { method: "POST", path: "/api/cart/add" },
    getCartItems: { method: "GET", path: "/api/cart" },
    updateCartItemQuantity: { method: "PATCH", path: "/api/cart/:id" },
    removeFromCart: { method: "DELETE", path: "/api/cart/:id" },
    clearCart: { method: "DELETE", path: "/api/cart" },
  },
  orders: {
    createOrder: { method: "POST", path: "/api/orders" },
    getUserOrders: { method: "GET", path: "/api/orders" },
    reorder: { method: "POST", path: "/api/orders/reorder" },
    getAllOrders: { method: "GET", path: "/api/admin/orders" },
    updateOrderStatus: { method: "PATCH", path: "/api/admin/orders/:id/status" },
  },
  loyalty: {
    getUserLoyaltyPoints: { method: "GET", path: "/api/loyalty/summary" },
    getUserLoyaltyTransactions: { method: "GET", path: "/api/loyalty/transactions" },
  },
  reviews: {
    getAllReviews: { method: "GET", path: "/api/admin/reviews" },
  },
  admin: {
    users: {
      updateUserRole: { method: "PATCH", path: "/api/admin/users/:id/role" },
    },
    staff: {
      getAllStaff: { method: "GET", path: "/api/admin/staff" },
    },
  },
};

export function resolvePath(descriptor: Descriptor, body?: any) {
  if (!descriptor.path.includes(":")) return descriptor;
  const path = descriptor.path.replace(":id", body?.cartItemId || body?.id);
  return { ...descriptor, path };
}

export function useMutationWithParams<R = any>(descriptor: Descriptor) {
  return async (body?: any): Promise<R> => {
    const d = resolvePath(descriptor, body);
    const hdr = authHeader();
    const opts: any = { method: d.method, headers: { ...hdr, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined };
    const r = await fetch(`${baseUrl}${d.path}`, opts);
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || "Request failed");
    }
    return r.json().catch(() => ({} as R));
  };
}