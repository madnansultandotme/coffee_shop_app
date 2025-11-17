import { MongoMemoryServer } from "mongodb-memory-server";

export async function startMemoryServer() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = "test";
  process.env.ENABLE_CSRF = "true";
  const app = (await import("../index.js")).default;
  return { app, mongod };
}

export async function stopMemoryServer(mongod) {
  await mongod.stop();
}