import { Router } from "express";
import {
  assignRouterToReseller,
  createRouter,
  deleteRouter,
  getCurretAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  updateAdminAccountDetails,
  updateAdminAvatar,
} from "../controllers/admin.controller.js";
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

// Router Management
router.route("/router/createRouter").post(verifyJWT, createRouter);
router.route("/router/assignRouter").patch(verifyJWT, assignRouterToReseller);
router.route("/router/deleteRouter").delete(verifyJWT, deleteRouter);

export default router;
