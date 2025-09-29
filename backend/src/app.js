import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// RouterOS specific rate limiting
const routerOSLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 RouterOS requests per minute
  message: "Too many RouterOS requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1/routers", routerOSLimiter);
app.use("/api/v1/ppp-clients", routerOSLimiter);
app.use("/api/v1/routeros-profiles", routerOSLimiter);

app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import adminRouter from "./routes/admin.route.js";
import resellerRouter from "./routes/reseller.routes.js";
import superAdminRouter from "./routes/superAdmin.routes.js";

// routes declaration ====><====
// SuperAmin
app.use("/api/v1/superadmin", superAdminRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/reseller", resellerRouter);

export { app };
