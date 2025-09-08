import { Router } from "express";
import {
  getCurretAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  updateAdminAccountDetails,
  updateAdminAvatar,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginAdmin);

// Secured Routes - Login required
router.route("/logout").post(verifyJWT, logoutAdmin);
router.route("/getCurretAdmin").post(verifyJWT, getCurretAdmin);
router
  .route("/updateAccountDetails")
  .post(verifyJWT, updateAdminAccountDetails);
router.route("/updateAvatar").post(verifyJWT, updateAdminAvatar);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
