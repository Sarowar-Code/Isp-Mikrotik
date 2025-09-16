import { Router } from "express";
import {
  loginReseller,
  logoutReseller,
  refreshAccessToken,
} from "../controllers/reseller/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.use(verifyJWT, requireReseller);
// Auth Reseller
router.route("/login").post(loginReseller);
router.route("/refresh-token").post(refreshAccessToken);

// Reseller verified Route
router.route("/logout").post(verifyJWT, logoutReseller);

export default router;
