import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { startMemoryServer, stopMemoryServer } from "./utils.js";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import { permissionsForRole } from "../utils/permissions.js";

let app, mongod;

beforeAll(async () => {
  const s = await startMemoryServer();
  app = s.app;
  mongod = s.mongod;
}, 120000);

afterAll(async () => {
  await stopMemoryServer(mongod);
}, 120000);

describe("RBAC", () => {
  it("forbids customer from admin endpoints", async () => {
    const signUp = await request(app).post("/api/auth/sign-in").send({ email: "cust@example.com", password: "secret123", flow: "signUp" });
    const token = signUp.body.token;
    const res = await request(app).get("/api/admin/orders").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("allows admin to access admin endpoints", async () => {
    await request(app).post("/api/auth/sign-in").send({ email: "admin@example.com", password: "secret123", flow: "signUp" });
    const adminUser = await User.findOne({ email: "admin@example.com" });
    let profile = await UserProfile.findOne({ userId: adminUser._id });
    Object.assign(profile, { role: "admin", permissions: permissionsForRole("admin") });
    await profile.save();
    const signIn = await request(app).post("/api/auth/sign-in").send({ email: "admin@example.com", password: "secret123", flow: "signIn" });
    const token = signIn.body.token;
    const res = await request(app).get("/api/admin/orders").set("Authorization", `Bearer ${token}`);
    expect([200, 204]).toContain(res.status);
  });
});