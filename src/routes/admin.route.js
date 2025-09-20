import { Router } from "express";
import {
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
} from "../controllers/admin/auth.controller.js";
import {
  getCurretAdmin,
  updateAdminAccountDetails,
  updateAdminAvatar,
} from "../controllers/admin/profile.controller.js";
import {
  assignRouter,
  deleteRouter,
  getRouterPppProfiles,
  getRouterPppSecrets,
  getRouterStatus,
  registerRouter,
  testRouterConnection,
  unAssignRouter,
  updateRouter,
} from "../controllers/admin/router.controller.js";
import {
  deleteResellerById,
  getAllResellers,
  getResellerById,
  registerReseller,
} from "../controllers/reseller/reseller.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/login").post(loginAdmin);

// Secured Routes - Login required
router.route("/logout").post(verifyJWT, logoutAdmin);
router.route("/getCurretAdmin").get(verifyJWT, getCurretAdmin);
router
  .route("/updateAccountDetails")
  .patch(verifyJWT, updateAdminAccountDetails);
router
  .route("/updateAvatar")
  .patch(verifyJWT, upload.single("avatar"), updateAdminAvatar);
router.route("/refresh-token").post(refreshAccessToken);

// Reseller Route Management

router
  .route("/registerReseller")
  .post(verifyJWT, upload.single("avatar"), registerReseller);
router.route("/getAllReseller").get(verifyJWT, getAllResellers);
router.route("/getReseller").get(verifyJWT, getResellerById);
router.route("/deleteReseller").delete(verifyJWT, deleteResellerById);

// Router Management //
router.route("/router/createRouter").post(verifyJWT, registerRouter);
router.route("/router/assignRouter").patch(verifyJWT, assignRouter);
router.route("/router/unAssignRouter").patch(verifyJWT, unAssignRouter);
router.route("/router/updateRouter").patch(verifyJWT, updateRouter);
router.route("/router/deleteRouter").delete(verifyJWT, deleteRouter);
router.route("/router/getRouterStatus").get(verifyJWT, getRouterStatus);
router
  .route("/router/testRouterConnection")
  .get(verifyJWT, testRouterConnection);
router
  .route("/router/getRouterPppProfiles")
  .get(verifyJWT, getRouterPppProfiles);
router.route("/router/getRouterPppSecrets").get(verifyJWT, getRouterPppSecrets);

export default router;
