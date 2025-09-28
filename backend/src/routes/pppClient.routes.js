import express from "express";
import {
  bulkSyncPppClients,
  createPppClient,
  deletePppClient,
  getActivePppConnections,
  getPppClient,
  getPppClients,
  syncPppClient,
  togglePppClientStatus,
  updatePppClient,
  validateCreatePppClient,
  validateUpdatePppClient,
} from "../controllers/reseller/pppClient.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireReseller } from "../middlewares/roles.middleware.js";

const router = express.Router();

// Apply JWT verification and role guard to all routes
router.use(verifyJWT, requireReseller);

// PPP Client CRUD routes
router
  .route("/")
  .post(validateCreatePppClient, createPppClient)
  .get(getPppClients);

router
  .route("/:id")
  .get(getPppClient)
  .put(validateUpdatePppClient, updatePppClient)
  .delete(deletePppClient);

// PPP Client specific operations
router.route("/:id/toggle-status").patch(togglePppClientStatus);

router.route("/:id/sync").post(syncPppClient);

// Bulk operations
router.route("/bulk/sync").post(bulkSyncPppClients);

// Router-specific operations
router
  .route("/router/:routerId/active-connections")
  .get(getActivePppConnections);

export default router;
