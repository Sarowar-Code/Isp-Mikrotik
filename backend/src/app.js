import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import adminRouter from "./routes/admin.route.js";
import resellerRouter from "./routes/reseller.routes.js";
import superAdminRouter from "./routes/superAdmin.routes.js";

const app = express();

app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// RouterOS limiter
const routerOSLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});

app.use("/api/v1/routers", routerOSLimiter);
app.use("/api/v1/ppp-clients", routerOSLimiter);
app.use("/api/v1/routeros-profiles", routerOSLimiter);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


// Routes
app.use("/api/v1/superadmin", superAdminRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/reseller", resellerRouter);

export { app };
