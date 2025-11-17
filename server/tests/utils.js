// Using local, already-installed MongoDB for tests; no in-memory server.

export async function startMemoryServer() {
  const unique = `coffee_shop_app_test_${process.pid}_${Date.now()}`;
  const defaultUri = `mongodb://127.0.0.1:27017/${unique}`;
  const uri = process.env.MONGODB_URI || defaultUri;
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = "test";
  process.env.ENABLE_CSRF = "true";
  const app = (await import("../index.js")).default;
  return { app, mongod: null };
}

export async function stopMemoryServer(mongod) {
  // No-op: using local MongoDB
}