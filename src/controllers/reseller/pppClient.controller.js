import { validationResult } from "express-validator";
import { Package } from "../../models/package.model.js";
import { PppClient } from "../../models/pppClient.model.js";
import { Router } from "../../models/router.model.js";
import { routerOSService } from "../../services/routeros.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Helper: ensure reseller owns the router
const assertRouterAssignedToReseller = async (routerId, resellerId) => {
  const router = await Router.findById(routerId).select("assignedFor");
  if (!router) {
    throw new ApiError(404, "Router not found");
  }
  if (router.assignedFor?.toString() !== resellerId.toString()) {
    throw new ApiError(403, "Forbidden: router not assigned to reseller");
  }
  return router;
};

// Helper: ensure reseller owns the package
const assertPackageOwnedByReseller = async (packageId, resellerId) => {
  const packageDoc = await Package.findById(packageId).select("resellerId");
  if (!packageDoc) {
    throw new ApiError(404, "Package not found");
  }
  if (packageDoc.resellerId?.toString() !== resellerId.toString()) {
    throw new ApiError(403, "Forbidden: package not owned by reseller");
  }
  return packageDoc;
};

const getAllPppProfiles = asyncHandler(async (req, res) => {
  const { routerId } = req.query;

  if (!routerId) {
    throw new ApiError(400, "RouterId is required");
  }

  const router = await assertRouterAssignedToReseller(routerId, req.auth._id);

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

// Create PPP Client
const createPppClient = asyncHandler(async (req, res) => {
  const {
    name,
    username, // optional
    email,
    password,
    contact,
    whatsapp,
    nid,
    address,
    clientType,
    connectionType, // service > pppoe
    packageId,
    paymentDeadline,
  } = req.body;

  if (
    !name ||
    !username ||
    !email ||
    !password ||
    !contact ||
    !whatsapp ||
    !nid ||
    !address ||
    !clientType ||
    !connectionType ||
    !packageId ||
    !paymentDeadline
  ) {
    throw new ApiError(400, "All Feilds are required");
  }

  // Check if user already exists
  const existingClient = await PppClient.findOne({
    $or: [{ email }, { username }],
  });

  if (existingClient) {
    throw new ApiError(400, "Client with this email or user ID already exists");
  }

  // Verify ownership: package belongs to reseller and router assigned to reseller
  await assertPackageOwnedByReseller(packageId, req.auth._id);
  const router = await assertRouterAssignedToReseller(routerId, req.auth._id);

  // Create client in database
  const pppClient = await PppClient.create({
    createdBy: req.user._id,
    name,
    userId,
    email,
    password,
    contact,
    whatsapp,
    nid,
    address,
    clientType,
    connectionType,
    macAddress,
    manualMac,
    service,
    package: packageId,
    routerId,
    routerosProfile,
    paymentDeadline,
  });

  // Create PPP secret on RouterOS
  try {
    const command = [
      "/ppp/secret/add",
      `=name=${userId}`,
      `=password=${password}`,
      `=profile=${routerosProfile}`,
      `=service=${service}`,
      `=comment=${name} - ${email}`,
    ];

    const result = await routerOSService.executeCommand(routerId, command);

    // Update client with RouterOS data
    pppClient.routerosSecretId = result[0]?.ret || "";
    pppClient.isActiveOnRouter = true;
    pppClient.syncStatus = "synced";
    pppClient.lastSyncAt = new Date();
    await pppClient.save();

    res
      .status(201)
      .json(new ApiResponse(201, pppClient, "PPP Client created successfully"));
  } catch (error) {
    // Update sync status on failure
    pppClient.syncStatus = "failed";
    pppClient.syncError = error.message;
    await pppClient.save();

    throw new ApiError(
      500,
      `Failed to create PPP secret on router: ${error.message}`
    );
  }
});

// Get all PPP Clients
export const getPppClients = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    routerId = "",
    packageId = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { userId: { $regex: search, $options: "i" } },
      { contact: { $regex: search, $options: "i" } },
    ];
  }

  // Status filter
  if (status) {
    query.syncStatus = status;
  }

  // Scope to reseller-owned routers
  const resellerRouterIds = await Router.find({
    assignedFor: req.auth._id,
  }).distinct("_id");
  query.routerId = { $in: resellerRouterIds };
  // Additional Router filter (must still be within owned routers)
  if (routerId) {
    query.routerId = { $in: resellerRouterIds, $eq: routerId };
  }

  // Package filter: ensure package belongs to reseller
  if (packageId) {
    const owned = await Package.exists({
      _id: packageId,
      resellerId: req.auth._id,
    });
    if (!owned) {
      throw new ApiError(403, "Forbidden: package not owned by reseller");
    }
    query.package = packageId;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    populate: [
      { path: "package", select: "name price bandwidthUp bandwidthDown" },
      { path: "routerId", select: "host" },
      { path: "createdBy", select: "name email" },
    ],
  };

  const clients = await PppClient.paginate(query, options);

  res
    .status(200)
    .json(new ApiResponse(200, clients, "PPP Clients retrieved successfully"));
});

// Get single PPP Client
export const getPppClient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await PppClient.findById(id)
    .populate("package", "name price bandwidthUp bandwidthDown")
    .populate("routerId", "host port")
    .populate("createdBy", "name email");

  if (!client) {
    throw new ApiError(404, "PPP Client not found");
  }

  // Ownership check: router assigned and package owned by reseller
  const routerDoc = await Router.findById(client.routerId).select(
    "assignedFor"
  );
  const packageDoc = await Package.findById(client.package).select(
    "resellerId"
  );
  if (
    routerDoc?.assignedFor?.toString() !== req.auth._id.toString() ||
    packageDoc?.resellerId?.toString() !== req.auth._id.toString()
  ) {
    throw new ApiError(403, "Forbidden");
  }

  res
    .status(200)
    .json(new ApiResponse(200, client, "PPP Client retrieved successfully"));
});

// Update PPP Client
export const updatePppClient = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { id } = req.params;
  const updateData = req.body;

  const client = await PppClient.findById(id);
  if (!client) {
    throw new ApiError(404, "PPP Client not found");
  }

  // Ownership check for existing client
  await assertRouterAssignedToReseller(client.routerId, req.auth._id);
  await assertPackageOwnedByReseller(client.package, req.auth._id);

  // If changing router or package, ensure new ones are also owned
  if (
    req.body.routerId &&
    req.body.routerId.toString() !== client.routerId.toString()
  ) {
    await assertRouterAssignedToReseller(req.body.routerId, req.auth._id);
  }
  if (
    req.body.package &&
    req.body.package.toString() !== client.package.toString()
  ) {
    await assertPackageOwnedByReseller(req.body.package, req.auth._id);
  }

  // Update in database
  const updatedClient = await PppClient.findByIdAndUpdate(
    id,
    { ...updateData, syncStatus: "pending" },
    { new: true, runValidators: true }
  );

  // Update on RouterOS if client exists there
  if (client.isActiveOnRouter && client.routerosSecretId) {
    try {
      const command = [
        "/ppp/secret/set",
        `=.id=${client.routerosSecretId}`,
        `=name=${updateData.userId || client.userId}`,
        `=password=${updateData.password || client.password}`,
        `=profile=${updateData.routerosProfile || client.routerosProfile}`,
        `=service=${updateData.service || client.service}`,
        `=comment=${updateData.name || client.name} - ${
          updateData.email || client.email
        }`,
      ];

      await routerOSService.executeCommand(client.routerId, command);

      updatedClient.syncStatus = "synced";
      updatedClient.lastSyncAt = new Date();
      updatedClient.syncError = "";
      await updatedClient.save();
    } catch (error) {
      updatedClient.syncStatus = "failed";
      updatedClient.syncError = error.message;
      await updatedClient.save();
    }
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedClient, "PPP Client updated successfully")
    );
});

// Delete PPP Client
export const deletePppClient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await PppClient.findById(id);
  if (!client) {
    throw new ApiError(404, "PPP Client not found");
  }

  // Ownership check
  await assertRouterAssignedToReseller(client.routerId, req.auth._id);
  await assertPackageOwnedByReseller(client.package, req.auth._id);

  // Delete from RouterOS if exists
  if (client.isActiveOnRouter && client.routerosSecretId) {
    try {
      const command = ["/ppp/secret/remove", `=.id=${client.routerosSecretId}`];
      await routerOSService.executeCommand(client.routerId, command);
    } catch (error) {
      // Log error but continue with database deletion
      console.error("Failed to delete from RouterOS:", error.message);
    }
  }

  // Delete from database
  await PppClient.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "PPP Client deleted successfully"));
});

// Enable/Disable PPP Client on Router
export const togglePppClientStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'enable' or 'disable'

  if (!["enable", "disable"].includes(action)) {
    throw new ApiError(400, "Action must be either enable or disable");
  }

  const client = await PppClient.findById(id);
  if (!client) {
    throw new ApiError(404, "PPP Client not found");
  }

  // Ownership check
  await assertRouterAssignedToReseller(client.routerId, req.auth._id);
  await assertPackageOwnedByReseller(client.package, req.auth._id);

  if (!client.routerosSecretId) {
    throw new ApiError(400, "Client not synced with RouterOS");
  }

  try {
    const command = [
      "/ppp/secret/set",
      `=.id=${client.routerosSecretId}`,
      `=disabled=${action === "disable" ? "yes" : "no"}`,
    ];

    await routerOSService.executeCommand(client.routerId, command);

    client.isActiveOnRouter = action === "enable";
    client.syncStatus = "synced";
    client.lastSyncAt = new Date();
    client.syncError = "";
    await client.save();

    res
      .status(200)
      .json(new ApiResponse(200, client, `PPP Client ${action}d successfully`));
  } catch (error) {
    client.syncStatus = "failed";
    client.syncError = error.message;
    await client.save();

    throw new ApiError(
      500,
      `Failed to ${action} client on router: ${error.message}`
    );
  }
});

// Sync PPP Client with RouterOS
export const syncPppClient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await PppClient.findById(id);
  if (!client) {
    throw new ApiError(404, "PPP Client not found");
  }

  // Ownership check
  await assertRouterAssignedToReseller(client.routerId, req.auth._id);
  await assertPackageOwnedByReseller(client.package, req.auth._id);

  try {
    // Check if secret exists on router
    const checkCommand = ["/ppp/secret/print", `?name=${client.userId}`];
    const existingSecrets = await routerOSService.executeCommand(
      client.routerId,
      checkCommand
    );

    if (existingSecrets.length > 0) {
      // Update existing secret
      const secretId = existingSecrets[0][".id"];
      const command = [
        "/ppp/secret/set",

        `=.id=${secretId}`,
        `=name=${client.userId}`,
        `=password=${client.password}`,
        `=profile=${client.routerosProfile}`,
        `=service=${client.service}`,
        `=comment=${client.name} - ${client.email}`,
      ];

      await routerOSService.executeCommand(client.routerId, command);

      client.routerosSecretId = secretId;
      client.isActiveOnRouter = true;
    } else {
      // Create new secret
      const command = [
        "/ppp/secret/add",
        `=name=${client.userId}`,
        `=password=${client.password}`,
        `=profile=${client.routerosProfile}`,
        `=service=${client.service}`,
        `=comment=${client.name} - ${client.email}`,
      ];

      const result = await routerOSService.executeCommand(
        client.routerId,
        command
      );
      client.routerosSecretId = result[0]?.ret || "";
      client.isActiveOnRouter = true;
    }

    client.syncStatus = "synced";
    client.lastSyncAt = new Date();
    client.syncError = "";
    await client.save();

    res
      .status(200)
      .json(new ApiResponse(200, client, "PPP Client synced successfully"));
  } catch (error) {
    client.syncStatus = "failed";
    client.syncError = error.message;
    await client.save();

    throw new ApiError(500, `Sync failed: ${error.message}`);
  }
});

// Get active PPP connections
export const getActivePppConnections = asyncHandler(async (req, res) => {
  const { routerId } = req.params;

  if (!routerId) {
    throw new ApiError(400, "Router ID is required");
  }

  try {
    const command = ["/ppp/active/print"];
    const activeConnections = await routerOSService.executeCommand(
      routerId,
      command
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activeConnections,
          "Active PPP connections retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to get active connections: ${error.message}`
    );
  }
});

// Bulk operations
export const bulkSyncPppClients = asyncHandler(async (req, res) => {
  const { clientIds, action } = req.body;

  if (!Array.isArray(clientIds) || clientIds.length === 0) {
    throw new ApiError(400, "Client IDs array is required");
  }

  if (!["sync", "enable", "disable"].includes(action)) {
    throw new ApiError(400, "Action must be sync, enable, or disable");
  }

  const results = {
    successful: [],
    failed: [],
  };

  for (const clientId of clientIds) {
    try {
      const client = await PppClient.findById(clientId);
      if (!client) {
        results.failed.push({ clientId, error: "Client not found" });
        continue;
      }

      if (action === "sync") {
        // Sync logic here (similar to syncPppClient)
        // ... implementation
      } else {
        // Enable/disable logic here
        // ... implementation
      }

      results.successful.push(clientId);
    } catch (error) {
      results.failed.push({ clientId, error: error.message });
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, results, `Bulk ${action} operation completed`));
});
