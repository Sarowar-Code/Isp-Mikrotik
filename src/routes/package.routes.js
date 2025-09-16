import express from "express";
import {
  bulkSyncPackages,
  createPackage,
  deletePackage,
  getPackage,
  getPackages,
  getPackagesFromRouter,
  syncPackage,
  updatePackage,
  validateCreatePackage,
  validateUpdatePackage,
} from "../controllers/package.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

const router = express.Router();

// Apply JWT verification and role guard to all routes
router.use(verifyJWT, requireAdmin);

// Package CRUD routes
router.route("/").post(validateCreatePackage, createPackage).get(getPackages);

router
  .route("/:id")
  .get(getPackage)
  .put(validateUpdatePackage, updatePackage)
  .delete(deletePackage);

// Package specific operations
router.route("/:id/sync").post(syncPackage);

// Bulk operations
router.route("/bulk/sync").post(bulkSyncPackages);

// Router-specific operations
router.route("/router/:routerId/profiles").get(getPackagesFromRouter);

export default router;
