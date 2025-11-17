import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/coffee_shop_app";
export const JWT_SECRET = process.env.JWT_SECRET || "change_me";
export const PORT = Number(process.env.PORT || 4000);
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
export const ENABLE_CSRF = process.env.ENABLE_CSRF === "true";
export const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@coffeeshop.com";
export const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
export const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "Admin";