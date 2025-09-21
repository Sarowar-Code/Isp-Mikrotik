import { RouterOSAPI } from "node-routeros";
import { Reseller } from "../../models/reseller.model.js";
import { Router } from "../../models/router.model.js";
import { routerOSService } from "../../services/routeros.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const registerRouter = asyncHandler(async (req, res) => {
  const { host, port, username, password, apiType, notes } = req.body;

  // Validate input
  if (!host || !username || !password) {
    throw new ApiError(400, "All Feilds are required");
  }

  // Optional: Validate port range
  if (port && (port < 1 || port > 65535)) {
    throw new ApiError(400, "Port must be between 1 and 65535.");
  }

  // Check if router with same host + username already exists
  const existingRouter = await Router.findOne({
    $or: [{ host }, { username }],
  });

  if (existingRouter) {
    throw new ApiError(
      409,
      "Router with this host and username already exists."
    );
  }

  // Create router
  const router = await Router.create({
    owner: req.auth._id, // assuming auth middleware sets req.user
    host,
    port: port || 8728,
    username,
    password,
    apiType: apiType || "api",
    notes: notes || "",
  });

  if (!router) {
    throw new ApiError(400, "Failed to create Router");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, router, "Router Created Successfully"));
});

const getRouters = asyncHandler(async (req, res) => {
  const routers = await Router.find({ owner: req.auth._id });

  if (!routers) {
    throw new ApiError(400, "failed to get routers");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, routers, "Routers Fetched Successfully"));
});

const getRouter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const router = await Router.findById(id);

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, router, "Router retrieved successfully"));
});

const updateRouter = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const { host, port, username, password, apiType, notes, isActive, status } =
    req.body;

  // Find router
  const router = await Router.findById(id);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  // Only owner Admin can update
  if (router.owner.toString() !== req.auth._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this Router");
  }

  // Update fields (only if provided)
  if (host) router.host = host;
  if (port) {
    if (port < 1 || port > 65535) {
      throw new ApiError(400, "Port must be between 1 and 65535.");
    }
    router.port = port;
  }
  if (username) router.username = username;
  if (password) router.password = password; // later: hash/encrypt
  if (apiType) router.apiType = apiType;
  if (notes !== undefined) router.notes = notes;
  if (isActive !== undefined) router.isActive = isActive;
  if (status) router.status = status;

  await router.save();

  return res
    .status(200)
    .json(new ApiResponse(200, router, "Router Updated Successfully"));
});

const deleteRouter = asyncHandler(async (req, res) => {
  const { id } = req.query;

  const router = await Router.findById(id);

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  // Close connection if exists
  await routerOSService.closeConnection(id);

  // Delete router
  const deletedRouter = await Router.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Router deleted successfully"));
});

const assignRouter = asyncHandler(async (req, res) => {
  const { routerId, resellerId } = req.body;

  // Validate request
  if (!routerId || !resellerId) {
    throw new ApiError(400, "Router ID and Reseller ID are required.");
  }

  // Find router
  const router = await Router.findById(routerId);
  if (!router) {
    throw new ApiError(404, "Router Not Found");
  }

  // Ownership check
  if (router.owner.toString() !== req.auth._id.toString()) {
    throw new ApiError(403, "You are not authorized to assign this router.");
  }

  // Find reseller
  const reseller = await Reseller.findById(resellerId);
  if (!reseller) {
    throw new ApiError(404, "Reseller not found");
  }

  // Assign router
  router.assignedFor = reseller._id;
  await router.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        routerId: router._id,
        assignedFor: reseller._id,
        resellerName: reseller.fullName,
      },
      "Router Assigned successfully"
    )
  );
});

const unAssignRouter = asyncHandler(async (req, res) => {
  const { routerId } = req.query; // or req.params depending on your route

  if (!routerId) {
    throw new ApiError(400, "RouterId is Required");
  }
  // 1. Find router
  const router = await Router.findById(routerId);

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  // 2. Check if already unassigned
  if (!router.assignedFor) {
    throw new ApiError(400, "Router is Already unassigned");
  }

  // 3. Unassign
  router.assignedFor = null;

  await router.save();

  // 4. Response
  return res
    .status(200)
    .json(new ApiResponse(200, router, "Router Unassigned Successfully"));
});

// Test Router Connection
const testRouterConnection = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const router = await Router.findById(id);

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  try {
    const testClient = new RouterOSAPI({
      host: router.host,
      user: router.username,
      password: router.password,
      port: router.port || 8728,
      ssl: router.apiType === "ssl-api",
      timeout: 10000,
    });

    await testClient.connect();

    const identity = await testClient.write("/system/identity/print");
    const version = await testClient.write("/system/resource/print");

    await testClient.close();

    return res.status(200).json(
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
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { connected: false, error: error.message, responseTime: Date.now() },
          "Router connection test failed"
        )
      );
  }
});

// Get Router Status

const getRouterStatus = async (req, res) => {
  const { id: routerId } = req.query;

  // Ensure connection exists
  const client = await routerOSService.getConnection(routerId);

  const status = await routerOSService.getConnectionStatus(routerId);

  res.json({
    success: true,
    message: "Router status retrieved successfully",
    data: {
      routerId,
      isActive: true, // From DB or logic
      connectionStatus: status,
      lastChecked: new Date(),
    },
  });
};

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
  const { id } = req.query;

  const router = await Router.findById(id);

  console.log(router);

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
  const { id } = req.query;

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

  return res
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
  assignRouter,
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
  registerRouter,
  testRouterConnection,
  toggleRouterStatus,
  unAssignRouter,
  updateRouter,
};
