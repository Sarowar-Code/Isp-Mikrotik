import { Router } from "express";
import {
  getCurrentSuperAdmin,
  loginSuperAdmin,
  logoutSuperAdmin,
  refreshAccessToken,
  registerSuperAdmin,
} from "../controllers/superAdmin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerSuperAdmin);
router.route("/login").post(loginSuperAdmin);

// Secured Routes - Login required
router.route("/logout").post(verifyJWT, logoutSuperAdmin);
router.route("/getCurrentSuperAdmin").post(verifyJWT, getCurrentSuperAdmin);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
