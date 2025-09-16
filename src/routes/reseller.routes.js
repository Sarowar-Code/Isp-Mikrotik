import { Router } from "express";
import {
  getMyRouters,
  getRouterPppSecretsForReseller,
} from "../controllers/reseller.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireReseller } from "../middlewares/roles.middleware.js";
import pppClientRouter from "./pppClient.routes.js";

const router = Router();

router.use(verifyJWT, requireReseller);

// Assigned routers for reseller
router.get("/routers", getMyRouters);

// PPP secrets directly from router (read-only)
router.get("/routers/:id/ppp-secrets", getRouterPppSecretsForReseller);

// Mount PPP client management under reseller namespace
router.use("/ppp-clients", pppClientRouter);

export default router;
