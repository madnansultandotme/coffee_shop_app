import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { startMemoryServer, stopMemoryServer } from "./utils.js";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from "../config/env.js";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";

let app, mongod;

beforeAll(async () => {
  const s = await startMemoryServer();
  app = s.app;
  mongod = s.mongod;
}, 120000);

afterAll(async () => {
  await stopMemoryServer(mongod);
}, 120000);

describe("Admin role protection", () => {
  it("seeds default admin on startup", async () => {
    const admin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
    expect(admin).toBeTruthy();
    const profile = await UserProfile.findOne({ userId: admin._id });
    expect(profile?.role).toBe("admin");
  });

  it("blocks assigning admin role via endpoint", async () => {
    const resAdmin = await request(app).post("/api/auth/sign-in").send({ email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD, flow: "signIn" });
    const adminToken = resAdmin.body.token;
    const signUpUser = await request(app).post("/api/auth/sign-in").send({ email: "user1@example.com", password: "secret123", flow: "signUp" });
    const targetUser = await User.findOne({ email: "user1@example.com" });
    const resp = await request(app)
      .patch(`/api/admin/users/${targetUser._id}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "admin" });
    expect(resp.status).toBe(403);
  });

  it("blocks changing admin role away from admin", async () => {
    const resAdmin = await request(app).post("/api/auth/sign-in").send({ email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD, flow: "signIn" });
    const adminToken = resAdmin.body.token;
    const admin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
    const resp = await request(app)
      .patch(`/api/admin/users/${admin._id}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "manager" });
    expect(resp.status).toBe(403);
  });
});