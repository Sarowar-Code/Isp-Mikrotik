import { body, param, validationResult } from "express-validator";
import { Router } from "../../models/router.model.js";
import { routerOSService } from "../../services/routeros.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Validation rules
export const validateCreateRouter = [
  body("host").isIP().withMessage("Valid IP address is required"),
  body("port")
    .isInt({ min: 1, max: 65535 })
    .withMessage("Port must be between 1 and 65535"),
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("assignedFor")
    .optional()
    .isMongoId()
    .withMessage("Valid reseller ID is required"),
  body("vlanId")
    .optional()
    .isInt({ min: 1, max: 4094 })
    .withMessage("VLAN ID must be between 1 and 4094"),
];

export const validateUpdateRouter = [
  param("id").isMongoId().withMessage("Valid router ID is required"),
  body("host").optional().isIP().withMessage("Valid IP address is required"),
  body("port")
    .optional()
    .isInt({ min: 1, max: 65535 })
    .withMessage("Port must be between 1 and 65535"),
  body("username")
    .optional()
    .notEmpty()
    .withMessage("Username cannot be empty"),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("Password cannot be empty"),
  body("assignedFor")
    .optional()
    .isMongoId()
    .withMessage("Valid reseller ID is required"),
  body("vlanId")
    .optional()
    .isInt({ min: 1, max: 4094 })
    .withMessage("VLAN ID must be between 1 and 4094"),
];

// Create Router
const createRouter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { host, port, username, password, assignedFor, vlanId } = req.body;

  // Check if router with same host already exists
  const existingRouter = await Router.findOne({ host });
  if (existingRouter) {
    throw new ApiError(400, "Router with this host already exists");
  }

  // Test connection before saving
  try {
    const { RouterOSAPI } = await import("node-routeros-v2");
    const testClient = new RouterOSAPI({
      host,
      user: username,
      password,
      port,
      timeout: 5000,
    });
    await testClient.connect();
    await testClient.close();
  } catch (error) {
    throw new ApiError(400, `Cannot connect to router: ${error.message}`);
  }

  // Create router in database
  const router = await Router.create({
    owner: req.user._id,
    host,
    port,
    username,
    password,
    assignedFor,
    vlanId,
    isActive: true,
  });

  res
    .status(201)
    .json(new ApiResponse(201, router, "Router created successfully"));
});

// Get all Routers
const getRouters = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    assignedFor = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Search filter
  if (search) {
    query.$or = [
      { host: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }

  // Status filter
  if (status) {
    query.isActive = status === "active";
  }

  // Assigned for filter
  if (assignedFor) {
    query.assignedFor = assignedFor;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    populate: [
      { path: "owner", select: "name email" },
      { path: "assignedFor", select: "name email" },
    ],
  };

  const routers = await Router.paginate(query, options);

  res
    .status(200)
    .json(new ApiResponse(200, routers, "Routers retrieved successfully"));
});

// Get single Router
const getRouter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id)
    .populate("owner", "name email")
    .populate("assignedFor", "name email");

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, router, "Router retrieved successfully"));
});

// Update Router
const updateRouter = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { id } = req.params;
  const updateData = req.body;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  // Test connection if host, port, username, or password is being updated
  if (
    updateData.host ||
    updateData.port ||
    updateData.username ||
    updateData.password
  ) {
    try {
      const { RouterOSAPI } = await import("node-routeros-v2");
      const testClient = new RouterOSAPI({
        host: updateData.host || router.host,
        user: updateData.username || router.username,
        password: updateData.password || router.password,
        port: updateData.port || router.port,
        timeout: 5000,
      });
      await testClient.connect();
      await testClient.close();
    } catch (error) {
      throw new ApiError(400, `Cannot connect to router: ${error.message}`);
    }
  }

  // Update router
  const updatedRouter = await Router.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedRouter, "Router updated successfully"));
});

// Delete Router
const deleteRouter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  // Close connection if exists
  await routerOSService.closeConnection(id);

  // Delete router
  await Router.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Router deleted successfully"));
});

// Test Router Connection
const testRouterConnection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    const { RouterOSAPI } = await import("node-routeros-v2");
    const testClient = new RouterOSAPI({
      host: router.host,
      user: router.username,
      password: router.password,
      port: router.port,
      timeout: 10000,
    });
    await testClient.connect();
    // Get basic router info
    const identity = await testClient.write("/system/identity/print");
    const version = await testClient.write("/system/resource/print");
    await testClient.close();
    res.status(200).json(
      new ApiResponse(
        200,
        {
          connected: true,
          identity: identity[0],
          version: version[0],
          responseTime: Date.now(),
        },
        "Router connection test successful"
      )
    );
  } catch (error) {
    res.status(200).json(
      new ApiResponse(
        200,
        {
          connected: false,
          error: error.message,
          responseTime: Date.now(),
        },
        "Router connection test failed"
      )
    );
  }
});

// Get Router Status
const getRouterStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  const connectionStatus = routerOSService.getConnectionStatus(id);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        routerId: id,
        isActive: router.isActive,
        connectionStatus,
        lastChecked: new Date(),
      },
      "Router status retrieved successfully"
    )
  );
});

// Get Router System Information
const getRouterSystemInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    // Get system information
    const identity = await routerOSService.executeCommand(id, [
      "/system/identity/print",
    ]);
    const resource = await routerOSService.executeCommand(id, [
      "/system/resource/print",
    ]);
    const clock = await routerOSService.executeCommand(id, [
      "/system/clock/print",
    ]);
    const license = await routerOSService.executeCommand(id, [
      "/system/license/print",
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          identity: identity[0],
          resource: resource[0],
          clock: clock[0],
          license: license[0],
        },
        "Router system information retrieved successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to get router system info: ${error.message}`
    );
  }
});

// Get Router Interfaces
const getRouterInterfaces = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    const interfaces = await routerOSService.executeCommand(id, [
      "/interface/print",
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          interfaces,
          "Router interfaces retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to get router interfaces: ${error.message}`
    );
  }
});

// Get Router PPP Secrets
const getRouterPppSecrets = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    const secrets = await routerOSService.executeCommand(id, [
      "/ppp/secret/print",
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          secrets,
          "Router PPP secrets retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to get router PPP secrets: ${error.message}`
    );
  }
});

// Get Router PPP Profiles
const getRouterPppProfiles = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    const profiles = await routerOSService.executeCommand(id, [
      "/ppp/profile/print",
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          profiles,
          "Router PPP profiles retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to get router PPP profiles: ${error.message}`
    );
  }
});

// Get Router Active Connections
const getRouterActiveConnections = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    const activeConnections = await routerOSService.executeCommand(id, [
      "/ppp/active/print",
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activeConnections,
          "Router active connections retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to get router active connections: ${error.message}`
    );
  }
});

// Get Router Queue Rules
const getRouterQueueRules = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    const queueRules = await routerOSService.executeCommand(id, [
      "/queue/simple/print",
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          queueRules,
          "Router queue rules retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to get router queue rules: ${error.message}`
    );
  }
});

// Execute Custom RouterOS Command
const executeRouterOSCommand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { command } = req.body;

  if (!Array.isArray(command) || command.length === 0) {
    throw new ApiError(400, "Command must be a non-empty array");
  }

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    const result = await routerOSService.executeCommand(id, command);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "RouterOS command executed successfully")
      );
  } catch (error) {
    throw new ApiError(500, `RouterOS command failed: ${error.message}`);
  }
});

// Get Router Health Status
const getRouterHealthStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    const healthStatus = await routerOSService.healthCheck();
    const routerHealth = healthStatus.find((h) => h.routerId === id);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          routerId: id,
          isActive: router.isActive,
          health: routerHealth || { status: "unknown", connected: false },
          lastChecked: new Date(),
        },
        "Router health status retrieved successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to get router health status: ${error.message}`
    );
  }
});

// Toggle Router Status
const toggleRouterStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean value");
  }

  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  // Close connection if deactivating
  if (!isActive) {
    await routerOSService.closeConnection(id);
  }

  router.isActive = isActive;
  await router.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        router,
        `Router ${isActive ? "activated" : "deactivated"} successfully`
      )
    );
});

export {
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
};
