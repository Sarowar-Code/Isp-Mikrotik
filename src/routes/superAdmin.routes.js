import { Router } from "express";
import {
  loginSuperAdmin,
  logoutSuperAdmin,
  registerSuperAdmin,
} from "../controllers/superAdmin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/registerSuperAdmin").post(registerSuperAdmin);
router.route("/loginSuperAdmin").post(loginSuperAdmin);

// Secured Routes
router.route("/logoutSuperAdmin").post(verifyJWT, logoutSuperAdmin);

export default router;
