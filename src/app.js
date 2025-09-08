import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import adminRouter from "./routes/admin.route.js";
import superAdminRouter from "./routes/superAdmin.routes.js";

// routes declaration ====><====
// SuperAmin
app.use("/api/v1/superAdmin", superAdminRouter);
app.use("/api/v1/admin", adminRouter);

export { app };
