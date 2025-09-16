import express from "express";
import {
  createRouter,
  deleteRouter,
  executeRouterOSCommand,
  getRouter,
  getRouterActiveConnections,
  getRouterHealthStatus,
  getRouterInterfaces,
  getRouterPppProfiles,
  getRouterPppSecrets,
  getRouterQueueRules,
  getRouters,
  getRouterStatus,
  getRouterSystemInfo,
  testRouterConnection,
  toggleRouterStatus,
  updateRouter,
  validateCreateRouter,
  validateUpdateRouter,
} from "../controllers/admin/router.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js";

const router = express.Router();

// Apply JWT verification and role guard to all routes
router.use(verifyJWT, requireAdmin);

// Router CRUD routes

router.route("/").post(validateCreateRouter, createRouter).get(getRouters);

router
  .route("/:id")
  .get(getRouter)
  .put(validateUpdateRouter, updateRouter)
  .delete(deleteRouter);

// Router management operations
router.route("/:id/test-connection").post(testRouterConnection);

router.route("/:id/status").get(getRouterStatus);

router.route("/:id/health").get(getRouterHealthStatus);

router.route("/:id/toggle-status").patch(toggleRouterStatus);

// Router information routes
router.route("/:id/system-info").get(getRouterSystemInfo);

router.route("/:id/interfaces").get(getRouterInterfaces);

router.route("/:id/ppp-secrets").get(getRouterPppSecrets);

router.route("/:id/ppp-profiles").get(getRouterPppProfiles);

router.route("/:id/active-connections").get(getRouterActiveConnections);

router.route("/:id/queue-rules").get(getRouterQueueRules);

// Custom command execution
router.route("/:id/execute-command").post(executeRouterOSCommand);

export default router;
