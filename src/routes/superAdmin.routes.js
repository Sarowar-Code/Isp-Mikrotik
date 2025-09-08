import { Router } from "express";
import {
  deleteAdminById,
  getAdminById,
  getAllAdmins,
  getCurrentSuperAdmin,
  loginSuperAdmin,
  logoutSuperAdmin,
  refreshAccessToken,
  registerAdmin,
  registerSuperAdmin,
} from "../controllers/superAdmin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerSuperAdmin);
router.route("/login").post(loginSuperAdmin);

// Secured Routes - Login required
router.route("/logout").post(verifyJWT, logoutSuperAdmin);
router.route("/getCurrentSuperAdmin").post(verifyJWT, getCurrentSuperAdmin);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/registerAdmin").post(
  upload.single("avatar"), // <-- just the field name
  verifyJWT,
  registerAdmin
);

router.route("/getAllAdmins").post(verifyJWT, getAllAdmins);
router.route("/getAdmin").post(verifyJWT, getAdminById);
router.route("/deleteAdmin").post(verifyJWT, deleteAdminById);

export default router;
