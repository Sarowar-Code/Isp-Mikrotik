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

router.route("/registerSuperAdmin").post(registerSuperAdmin);
router.route("/loginSuperAdmin").post(loginSuperAdmin);

// Secured Routes - Login required
router.route("/logoutSuperAdmin").post(verifyJWT, logoutSuperAdmin);
router.route("/getCurrentSuperAdmin").post(verifyJWT, getCurrentSuperAdmin);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
