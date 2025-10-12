import { Router } from "express";
import {
  getCurrentSuperAdmin,
  loginSuperAdmin,
  logoutSuperAdmin,
  refreshAccessToken,
  registerSuperAdmin,
} from "../controllers/superAdmin/superAdmin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  deleteAdminById,
  getAdminById,
  getAllAdmins,
  registerAdmin,
} from "../controllers/admin/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerSuperAdmin);
router.route("/login").post(loginSuperAdmin);

// Secured superAdmin Routes - Login required
router.route("/logout").post(verifyJWT, logoutSuperAdmin);
router.route("/getCurrentAuthDetails").get(verifyJWT, getCurrentSuperAdmin);
router.route("/refresh-token").post(refreshAccessToken);

// Admin Routes
router.route("/registerAdmin").post(
  upload.single("avatar"), // <-- just the field name
  verifyJWT,
  registerAdmin
);
router.route("/getAllAdmins").get(verifyJWT, getAllAdmins);
router.route("/getAdmin").get(verifyJWT, getAdminById);
router.route("/deleteAdmin").delete(verifyJWT, deleteAdminById);

export default router;
