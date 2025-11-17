import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { CORS_ORIGIN, MONGODB_URI, PORT } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import menuRoutes from "./routes/menu.js";
import cartRoutes from "./routes/cart.js";
import loyaltyRoutes from "./routes/loyalty.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import { sanitizeMiddleware } from "./middleware/sanitize.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN, credentials: true, methods: ["GET","POST","PATCH","DELETE"], allowedHeaders: ["Content-Type","Authorization","x-csrf-token"] }));
app.use(helmet());
app.use(compression());
app.use(morgan("tiny"));
app.use(sanitizeMiddleware);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 300 });

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", writeLimiter, cartRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/orders", writeLimiter, orderRoutes);
app.use("/api/admin", adminRoutes);

connectDB(MONGODB_URI).then(() => {
  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}).catch(err => {
  console.error("MongoDB connection error", err);
  process.exit(1);
});

app.use(errorHandler);

export default app;