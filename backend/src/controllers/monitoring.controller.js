import { monitoringService } from "../services/monitoring.service.js";
import { routerOSService } from "../services/routeros.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get system metrics
export const getSystemMetrics = asyncHandler(async (req, res) => {
  const metrics = monitoringService.getMetrics();

  res
    .status(200)
    .json(
      new ApiResponse(200, metrics, "System metrics retrieved successfully")
    );
});

// Get router health summary
export const getRouterHealthSummary = asyncHandler(async (req, res) => {
  const summary = monitoringService.getRouterHealthSummary();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        summary,
        "Router health summary retrieved successfully"
      )
    );
});

// Get system alerts
export const getSystemAlerts = asyncHandler(async (req, res) => {
  const alerts = monitoringService.getSystemAlerts();

  res
    .status(200)
    .json(new ApiResponse(200, alerts, "System alerts retrieved successfully"));
});

// Get monitoring status
export const getMonitoringStatus = asyncHandler(async (req, res) => {
  const status = {
    isMonitoring: monitoringService.isMonitoring,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, status, "Monitoring status retrieved successfully")
    );
});

// Start monitoring
export const startMonitoring = asyncHandler(async (req, res) => {
  const { intervalMs = 300000 } = req.body; // 5 minutes default

  monitoringService.startMonitoring(intervalMs);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        message: "Monitoring started",
        intervalMs,
      },
      "Monitoring started successfully"
    )
  );
});

// Stop monitoring
export const stopMonitoring = asyncHandler(async (req, res) => {
  monitoringService.stopMonitoring();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Monitoring stopped" },
        "Monitoring stopped successfully"
      )
    );
});

// Force sync all entities
export const forceSyncAll = asyncHandler(async (req, res) => {
  try {
    await monitoringService.syncStatus();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Sync completed" },
          "Force sync completed successfully"
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(500, { error: error.message }, "Force sync failed")
      );
  }
});

// Get RouterOS service health
export const getRouterOSServiceHealth = asyncHandler(async (req, res) => {
  try {
    const healthStatus = await routerOSService.healthCheck();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          healthStatus,
          "RouterOS service health retrieved successfully"
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          { error: error.message },
          "Failed to get RouterOS service health"
        )
      );
  }
});

// Get detailed router information
export const getDetailedRouterInfo = asyncHandler(async (req, res) => {
  const { routerId } = req.params;

  try {
    const metrics = monitoringService.getMetrics();
    const routerInfo = metrics.routerConnections.get(routerId);

    if (!routerInfo) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, null, "Router not found in monitoring data")
        );
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          routerInfo,
          "Detailed router information retrieved successfully"
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          { error: error.message },
          "Failed to get detailed router information"
        )
      );
  }
});

// Get system performance metrics
export const getSystemPerformanceMetrics = asyncHandler(async (req, res) => {
  const performanceMetrics = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    title: process.title,
    argv: process.argv,
    execPath: process.execPath,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    },
  };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        performanceMetrics,
        "System performance metrics retrieved successfully"
      )
    );
});

// Get RouterOS connection pool status
export const getConnectionPoolStatus = asyncHandler(async (req, res) => {
  try {
    const metrics = monitoringService.getMetrics();
    const connectionPoolStatus = {
      totalConnections: metrics.routerConnections.size,
      connections: Array.from(metrics.routerConnections.entries()).map(
        ([routerId, status]) => ({
          routerId,
          status: status.status,
          lastChecked: status.lastChecked,
          systemInfo: status.systemInfo,
        })
      ),
    };

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          connectionPoolStatus,
          "Connection pool status retrieved successfully"
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          { error: error.message },
          "Failed to get connection pool status"
        )
      );
  }
});

// Get sync statistics
export const getSyncStatistics = asyncHandler(async (req, res) => {
  try {
    const metrics = monitoringService.getMetrics();
    const syncStats = {
      pppClients: metrics.pppClients,
      lastUpdate: metrics.lastUpdate,
      monitoringStatus: monitoringService.isMonitoring,
    };

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          syncStats,
          "Sync statistics retrieved successfully"
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          { error: error.message },
          "Failed to get sync statistics"
        )
      );
  }
});
