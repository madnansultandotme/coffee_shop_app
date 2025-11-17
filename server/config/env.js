import dotenv from "dotenv";
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/coffee_shop_app";
export const JWT_SECRET = process.env.JWT_SECRET || "change_me";
export const PORT = Number(process.env.PORT || 4000);
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
export const ENABLE_CSRF = process.env.ENABLE_CSRF === "true";