import { Router } from "express";
import {
  loginReseller,
  logoutReseller,
  refreshAccessToken,
} from "../controllers/reseller/auth.controller.js";
import { createPackage } from "../controllers/reseller/package.controller.js";
import {
  createPppClient,
  getAllPppProfiles,
  updatePppClient,
} from "../controllers/reseller/pppClient.controller.js";
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

// -----------------------PPP Client Routes---------------------------

router.route("/getRouterPppSecrets").get(verifyJWT, getAllPppProfiles);
router.route("/createPppClient").post(verifyJWT, createPppClient);
router.route("/updatePppClient").post(verifyJWT, updatePppClient);

// -----------------------Packages Routes---------------------------

router.route("/createPackage").post(verifyJWT, createPackage);

export default router;
