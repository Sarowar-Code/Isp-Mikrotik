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
router.route("/deleteReseller").post(verifyJWT, deleteResellerById);

// Router Management //
router.route("/router/createRouter").post(verifyJWT);
router.route("/router/assignRouter").patch(verifyJWT);
router.route("/router/deleteRouter").delete(verifyJWT);

export default router;
