import express from "express";
import {
    forceSyncAll,
    getConnectionPoolStatus,
    getDetailedRouterInfo,
    getMonitoringStatus,
    getRouterHealthSummary,
    getRouterOSServiceHealth,
    getSyncStatistics,
    getSystemAlerts,
    getSystemMetrics,
    getSystemPerformanceMetrics,
    startMonitoring,
    stopMonitoring,
} from "../controllers/monitoring.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// Monitoring routes
router.route("/metrics").get(getSystemMetrics);

router.route("/health-summary").get(getRouterHealthSummary);

router.route("/alerts").get(getSystemAlerts);

router.route("/status").get(getMonitoringStatus);

router.route("/start").post(startMonitoring);

router.route("/stop").post(stopMonitoring);

router.route("/force-sync").post(forceSyncAll);

router.route("/routeros-health").get(getRouterOSServiceHealth);

router.route("/router/:routerId/details").get(getDetailedRouterInfo);

router.route("/performance").get(getSystemPerformanceMetrics);

router.route("/connection-pool").get(getConnectionPoolStatus);

router.route("/sync-stats").get(getSyncStatistics);

export default router;
