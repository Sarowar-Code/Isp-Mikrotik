import { Router } from "express";
import {
  loginReseller,
  logoutReseller,
  refreshAccessToken,
} from "../controllers/reseller/auth.controller.js";
import {
  getCurretReseller,
  updateResellerAccountDetails,
  updateResellerAvatar,
} from "../controllers/reseller/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.use(verifyJWT, requireReseller);
// Auth Reseller
router.route("/login").post(loginReseller);
router.route("/refresh-token").post(refreshAccessToken);

// Reseller verified Route //
router.route("/logout").post(verifyJWT, logoutReseller);

// Reseller Profile Routes
router.route("/getCurrentReseller").get(verifyJWT, getCurretReseller);
router
  .route("/updateResellerDetails")
  .patch(verifyJWT, updateResellerAccountDetails);
router.route("/updateAvatar").patch(verifyJWT, updateResellerAvatar);
export default router;
