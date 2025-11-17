import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { startMemoryServer, stopMemoryServer } from "./utils.js";

let app, mongod;

beforeAll(async () => {
  const s = await startMemoryServer();
  app = s.app;
  mongod = s.mongod;
}, 120000);

afterAll(async () => {
  await stopMemoryServer(mongod);
}, 120000);

describe("Auth", () => {
  it("signs up with password and returns JWT + CSRF", async () => {
    const res = await request(app).post("/api/auth/sign-in").send({ email: "test@example.com", password: "secret123", flow: "signUp" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.csrfToken).toBeDefined();
  });

  it("signs in with password", async () => {
    const res = await request(app).post("/api/auth/sign-in").send({ email: "test@example.com", password: "secret123", flow: "signIn" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("creates anonymous session", async () => {
    const res = await request(app).post("/api/auth/anonymous").send({});
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});