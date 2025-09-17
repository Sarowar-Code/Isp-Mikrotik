import { body, param, validationResult } from "express-validator";
import { Package } from "../../models/package.model.js";
import { Router } from "../../models/router.model.js";
import { routerOSService } from "../../services/routeros.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Validation rules for Package (RouterOS Profile)
export const validateCreatePackage = [
  body("name").notEmpty().withMessage("Package name is required"),
  body("resellerId").isMongoId().withMessage("Valid reseller ID is required"),
  body("mikrotikRouterId")
    .isMongoId()
    .withMessage("Valid router ID is required"),
  body("price").isNumeric().withMessage("Price must be numeric"),
  body("bandwidthUp")
    .isNumeric()
    .withMessage("Upload bandwidth must be numeric"),
  body("bandwidthDown")
    .isNumeric()
    .withMessage("Download bandwidth must be numeric"),
  body("routerosProfileName")
    .notEmpty()
    .withMessage("RouterOS profile name is required"),
  body("remoteAddressPool")
    .notEmpty()
    .withMessage("Remote address pool is required"),
  // RouterOS Profile fields
  body("localAddress").optional().isString(),
  body("remoteAddress").optional().isString(),
  body("dnsServer").optional().isString(),
  body("winsServer").optional().isString(),
  body("useEncryption").optional().isIn(["yes", "no", "required"]),
  body("onlyOne").optional().isIn(["yes", "no"]),
  body("changeTcpMss").optional().isIn(["yes", "no"]),
  body("useCompression").optional().isIn(["yes", "no"]),
  body("useVjCompression").optional().isIn(["yes", "no"]),
  body("useUpnp").optional().isIn(["yes", "no"]),
  body("addressList").optional().isString(),
  body("incomingFilter").optional().isString(),
  body("outgoingFilter").optional().isString(),
  body("sessionTimeout").optional().isString(),
  body("idleTimeout").optional().isString(),
  body("keepaliveTimeout").optional().isString(),
  body("txBitrate").optional().isString(),
  body("rxBitrate").optional().isString(),
  body("txByteLimit").optional().isString(),
  body("rxByteLimit").optional().isString(),
  body("txPacketLimit").optional().isString(),
  body("rxPacketLimit").optional().isString(),
  body("description").optional().isString(),
];

export const validateUpdatePackage = [
  param("id").isMongoId().withMessage("Valid package ID is required"),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Package name cannot be empty"),
  body("price").optional().isNumeric().withMessage("Price must be numeric"),
  body("bandwidthUp")
    .optional()
    .isNumeric()
    .withMessage("Upload bandwidth must be numeric"),
  body("bandwidthDown")
    .optional()
    .isNumeric()
    .withMessage("Download bandwidth must be numeric"),
  body("routerosProfileName")
    .optional()
    .notEmpty()
    .withMessage("RouterOS profile name cannot be empty"),
  // RouterOS Profile fields
  body("localAddress").optional().isString(),
  body("remoteAddress").optional().isString(),
  body("dnsServer").optional().isString(),
  body("winsServer").optional().isString(),
  body("useEncryption").optional().isIn(["yes", "no", "required"]),
  body("onlyOne").optional().isIn(["yes", "no"]),
  body("changeTcpMss").optional().isIn(["yes", "no"]),
  body("useCompression").optional().isIn(["yes", "no"]),
  body("useVjCompression").optional().isIn(["yes", "no"]),
  body("useUpnp").optional().isIn(["yes", "no"]),
  body("addressList").optional().isString(),
  body("incomingFilter").optional().isString(),
  body("outgoingFilter").optional().isString(),
  body("sessionTimeout").optional().isString(),
  body("idleTimeout").optional().isString(),
  body("keepaliveTimeout").optional().isString(),
  body("txBitrate").optional().isString(),
  body("rxBitrate").optional().isString(),
  body("txByteLimit").optional().isString(),
  body("rxByteLimit").optional().isString(),
  body("txPacketLimit").optional().isString(),
  body("rxPacketLimit").optional().isString(),
  body("description").optional().isString(),
];

// Create Package (RouterOS Profile)
const createPackage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const {
    name,
    resellerId,
    mikrotikRouterId,
    price,
    billingCycle,
    bandwidthUp,
    bandwidthDown,
    routerosProfileName,
    remoteAddressPool,
    localAddress,
    remoteAddress,
    dnsServer,
    winsServer,
    useEncryption,
    onlyOne,
    changeTcpMss,
    useCompression,
    useVjCompression,
    useUpnp,
    addressList,
    incomingFilter,
    outgoingFilter,
    sessionTimeout,
    idleTimeout,
    keepaliveTimeout,
    txBitrate,
    rxBitrate,
    txByteLimit,
    rxByteLimit,
    txPacketLimit,
    rxPacketLimit,
    description,
  } = req.body;

  // Check if router exists
  const router = await Router.findById(mikrotikRouterId);
  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  // Check if package name already exists for this reseller
  const existingPackage = await Package.findOne({
    resellerId,
    name,
  });

  if (existingPackage) {
    throw new ApiError(
      400,
      "Package with this name already exists for this reseller"
    );
  }

  // Create package in database
  const packageDoc = await Package.create({
    createdByAdmin: req.user._id,
    resellerId,
    mikrotikRouterId,
    name,
    price,
    billingCycle: billingCycle || "monthly",
    bandwidthUp,
    bandwidthDown,
    routerosProfileName,
    remoteAddressPool,
    localAddress: localAddress || "",
    remoteAddress: remoteAddress || "",
    dnsServer: dnsServer || "",
    winsServer: winsServer || "",
    useEncryption: useEncryption || "no",
    onlyOne: onlyOne || "no",
    changeTcpMss: changeTcpMss || "no",
    useCompression: useCompression || "no",
    useVjCompression: useVjCompression || "no",
    useUpnp: useUpnp || "no",
    addressList: addressList || "",
    incomingFilter: incomingFilter || "",
    outgoingFilter: outgoingFilter || "",
    sessionTimeout: sessionTimeout || "0",
    idleTimeout: idleTimeout || "0",
    keepaliveTimeout: keepaliveTimeout || "0",
    txBitrate: txBitrate || "0",
    rxBitrate: rxBitrate || "0",
    txByteLimit: txByteLimit || "0",
    rxByteLimit: rxByteLimit || "0",
    txPacketLimit: txPacketLimit || "0",
    rxPacketLimit: rxPacketLimit || "0",
    description: description || "",
  });

  // Create profile on RouterOS
  try {
    const command = [
      "/ppp/profile/add",
      `=name=${routerosProfileName}`,
      `=local-address=${localAddress || ""}`,
      `=remote-address=${remoteAddress || ""}`,
      `=dns-server=${dnsServer || ""}`,
      `=wins-server=${winsServer || ""}`,
      `=use-encryption=${useEncryption || "no"}`,
      `=only-one=${onlyOne || "no"}`,
      `=change-tcp-mss=${changeTcpMss || "no"}`,
      `=use-compression=${useCompression || "no"}`,
      `=use-vj-compression=${useVjCompression || "no"}`,
      `=use-upnp=${useUpnp || "no"}`,
      `=address-list=${addressList || ""}`,
      `=incoming-filter=${incomingFilter || ""}`,
      `=outgoing-filter=${outgoingFilter || ""}`,
      `=session-timeout=${sessionTimeout || "0"}`,
      `=idle-timeout=${idleTimeout || "0"}`,
      `=keepalive-timeout=${keepaliveTimeout || "0"}`,
      `=tx-bitrate=${txBitrate || "0"}`,
      `=rx-bitrate=${rxBitrate || "0"}`,
      `=tx-byte-limit=${txByteLimit || "0"}`,
      `=rx-byte-limit=${rxByteLimit || "0"}`,
      `=tx-packet-limit=${txPacketLimit || "0"}`,
      `=rx-packet-limit=${rxPacketLimit || "0"}`,
      `=comment=${description || ""}`,
    ];

    await routerOSService.executeCommand(mikrotikRouterId, command);

    packageDoc.syncStatus = "synced";
    packageDoc.lastSyncAt = new Date();
    await packageDoc.save();

    res
      .status(201)
      .json(new ApiResponse(201, packageDoc, "Package created successfully"));
  } catch (error) {
    packageDoc.syncStatus = "failed";
    packageDoc.syncError = error.message;
    await packageDoc.save();

    throw new ApiError(
      500,
      `Failed to create profile on router: ${error.message}`
    );
  }
});

// Get all Packages
const getPackages = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    resellerId = "",
    routerId = "",
    syncStatus = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { routerosProfileName: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Reseller filter
  if (resellerId) {
    query.resellerId = resellerId;
  }

  // Router filter
  if (routerId) {
    query.mikrotikRouterId = routerId;
  }

  // Sync status filter
  if (syncStatus) {
    query.syncStatus = syncStatus;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    populate: [
      { path: "mikrotikRouterId", select: "host port" },
      { path: "resellerId", select: "name email" },
      { path: "createdByAdmin", select: "name email" },
    ],
  };

  const packages = await Package.paginate(query, options);

  res
    .status(200)
    .json(new ApiResponse(200, packages, "Packages retrieved successfully"));
});

// Get single Package
const getPackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const packageDoc = await Package.findById(id)
    .populate("mikrotikRouterId", "host port")
    .populate("resellerId", "name email")
    .populate("createdByAdmin", "name email");

  if (!packageDoc) {
    throw new ApiError(404, "Package not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, packageDoc, "Package retrieved successfully"));
});

// Update Package
const updatePackage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { id } = req.params;
  const updateData = req.body;

  const packageDoc = await Package.findById(id);
  if (!packageDoc) {
    throw new ApiError(404, "Package not found");
  }

  // Update in database
  const updatedPackage = await Package.findByIdAndUpdate(
    id,
    { ...updateData, syncStatus: "pending" },
    { new: true, runValidators: true }
  );

  // Update on RouterOS
  try {
    const command = [
      "/ppp/profile/set",
      `=.id=${packageDoc.routerosProfileName}`,
      `=name=${
        updateData.routerosProfileName || packageDoc.routerosProfileName
      }`,
      `=local-address=${updateData.localAddress || packageDoc.localAddress}`,
      `=remote-address=${updateData.remoteAddress || packageDoc.remoteAddress}`,
      `=dns-server=${updateData.dnsServer || packageDoc.dnsServer}`,
      `=wins-server=${updateData.winsServer || packageDoc.winsServer}`,
      `=use-encryption=${updateData.useEncryption || packageDoc.useEncryption}`,
      `=only-one=${updateData.onlyOne || packageDoc.onlyOne}`,
      `=change-tcp-mss=${updateData.changeTcpMss || packageDoc.changeTcpMss}`,
      `=use-compression=${
        updateData.useCompression || packageDoc.useCompression
      }`,
      `=use-vj-compression=${
        updateData.useVjCompression || packageDoc.useVjCompression
      }`,
      `=use-upnp=${updateData.useUpnp || packageDoc.useUpnp}`,
      `=address-list=${updateData.addressList || packageDoc.addressList}`,
      `=incoming-filter=${
        updateData.incomingFilter || packageDoc.incomingFilter
      }`,
      `=outgoing-filter=${
        updateData.outgoingFilter || packageDoc.outgoingFilter
      }`,
      `=session-timeout=${
        updateData.sessionTimeout || packageDoc.sessionTimeout
      }`,
      `=idle-timeout=${updateData.idleTimeout || packageDoc.idleTimeout}`,
      `=keepalive-timeout=${
        updateData.keepaliveTimeout || packageDoc.keepaliveTimeout
      }`,
      `=tx-bitrate=${updateData.txBitrate || packageDoc.txBitrate}`,
      `=rx-bitrate=${updateData.rxBitrate || packageDoc.rxBitrate}`,
      `=tx-byte-limit=${updateData.txByteLimit || packageDoc.txByteLimit}`,
      `=rx-byte-limit=${updateData.rxByteLimit || packageDoc.rxByteLimit}`,
      `=tx-packet-limit=${
        updateData.txPacketLimit || packageDoc.txPacketLimit
      }`,
      `=rx-packet-limit=${
        updateData.rxPacketLimit || packageDoc.rxPacketLimit
      }`,
      `=comment=${updateData.description || packageDoc.description}`,
    ];

    await routerOSService.executeCommand(packageDoc.mikrotikRouterId, command);

    updatedPackage.syncStatus = "synced";
    updatedPackage.lastSyncAt = new Date();
    updatedPackage.syncError = "";
    await updatedPackage.save();
  } catch (error) {
    updatedPackage.syncStatus = "failed";
    updatedPackage.syncError = error.message;
    await updatedPackage.save();
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedPackage, "Package updated successfully"));
});

// Delete Package
const deletePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const packageDoc = await Package.findById(id);
  if (!packageDoc) {
    throw new ApiError(404, "Package not found");
  }

  // Delete from RouterOS
  try {
    const command = [
      "/ppp/profile/remove",
      `=.id=${packageDoc.routerosProfileName}`,
    ];
    await routerOSService.executeCommand(packageDoc.mikrotikRouterId, command);
  } catch (error) {
    // Log error but continue with database deletion
    console.error("Failed to delete profile from RouterOS:", error.message);
  }

  // Delete from database
  await Package.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Package deleted successfully"));
});

// Sync Package with RouterOS
const syncPackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const packageDoc = await Package.findById(id);
  if (!packageDoc) {
    throw new ApiError(404, "Package not found");
  }

  try {
    // Check if profile exists on router
    const checkCommand = [
      "/ppp/profile/print",
      `?name=${packageDoc.routerosProfileName}`,
    ];
    const existingProfiles = await routerOSService.executeCommand(
      packageDoc.mikrotikRouterId,
      checkCommand
    );

    if (existingProfiles.length > 0) {
      // Update existing profile
      const command = [
        "/ppp/profile/set",
        `=.id=${packageDoc.routerosProfileName}`,
        `=name=${packageDoc.routerosProfileName}`,
        `=local-address=${packageDoc.localAddress}`,
        `=remote-address=${packageDoc.remoteAddress}`,
        `=dns-server=${packageDoc.dnsServer}`,
        `=wins-server=${packageDoc.winsServer}`,
        `=use-encryption=${packageDoc.useEncryption}`,
        `=only-one=${packageDoc.onlyOne}`,
        `=change-tcp-mss=${packageDoc.changeTcpMss}`,
        `=use-compression=${packageDoc.useCompression}`,
        `=use-vj-compression=${packageDoc.useVjCompression}`,
        `=use-upnp=${packageDoc.useUpnp}`,
        `=address-list=${packageDoc.addressList}`,
        `=incoming-filter=${packageDoc.incomingFilter}`,
        `=outgoing-filter=${packageDoc.outgoingFilter}`,
        `=session-timeout=${packageDoc.sessionTimeout}`,
        `=idle-timeout=${packageDoc.idleTimeout}`,
        `=keepalive-timeout=${packageDoc.keepaliveTimeout}`,
        `=tx-bitrate=${packageDoc.txBitrate}`,
        `=rx-bitrate=${packageDoc.rxBitrate}`,
        `=tx-byte-limit=${packageDoc.txByteLimit}`,
        `=rx-byte-limit=${packageDoc.rxByteLimit}`,
        `=tx-packet-limit=${packageDoc.txPacketLimit}`,
        `=rx-packet-limit=${packageDoc.rxPacketLimit}`,
        `=comment=${packageDoc.description}`,
      ];

      await routerOSService.executeCommand(
        packageDoc.mikrotikRouterId,
        command
      );
    } else {
      // Create new profile
      const command = [
        "/ppp/profile/add",
        `=name=${packageDoc.routerosProfileName}`,
        `=local-address=${packageDoc.localAddress}`,
        `=remote-address=${packageDoc.remoteAddress}`,
        `=dns-server=${packageDoc.dnsServer}`,
        `=wins-server=${packageDoc.winsServer}`,
        `=use-encryption=${packageDoc.useEncryption}`,
        `=only-one=${packageDoc.onlyOne}`,
        `=change-tcp-mss=${packageDoc.changeTcpMss}`,
        `=use-compression=${packageDoc.useCompression}`,
        `=use-vj-compression=${packageDoc.useVjCompression}`,
        `=use-upnp=${packageDoc.useUpnp}`,
        `=address-list=${packageDoc.addressList}`,
        `=incoming-filter=${packageDoc.incomingFilter}`,
        `=outgoing-filter=${packageDoc.outgoingFilter}`,
        `=session-timeout=${packageDoc.sessionTimeout}`,
        `=idle-timeout=${packageDoc.idleTimeout}`,
        `=keepalive-timeout=${packageDoc.keepaliveTimeout}`,
        `=tx-bitrate=${packageDoc.txBitrate}`,
        `=rx-bitrate=${packageDoc.rxBitrate}`,
        `=tx-byte-limit=${packageDoc.txByteLimit}`,
        `=rx-byte-limit=${packageDoc.rxByteLimit}`,
        `=tx-packet-limit=${packageDoc.txPacketLimit}`,
        `=rx-packet-limit=${packageDoc.rxPacketLimit}`,
        `=comment=${packageDoc.description}`,
      ];

      await routerOSService.executeCommand(
        packageDoc.mikrotikRouterId,
        command
      );
    }

    packageDoc.syncStatus = "synced";
    packageDoc.lastSyncAt = new Date();
    packageDoc.syncError = "";
    await packageDoc.save();

    res
      .status(200)
      .json(new ApiResponse(200, packageDoc, "Package synced successfully"));
  } catch (error) {
    packageDoc.syncStatus = "failed";
    packageDoc.syncError = error.message;
    await packageDoc.save();

    throw new ApiError(500, `Sync failed: ${error.message}`);
  }
});

// Get packages from RouterOS
const getPackagesFromRouter = asyncHandler(async (req, res) => {
  const { routerId } = req.params;

  if (!routerId) {
    throw new ApiError(400, "Router ID is required");
  }

  try {
    const command = ["/ppp/profile/print"];
    const profiles = await routerOSService.executeCommand(routerId, command);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          profiles,
          "RouterOS profiles retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to get profiles from router: ${error.message}`
    );
  }
});

// Bulk sync packages
const bulkSyncPackages = asyncHandler(async (req, res) => {
  const { packageIds, action } = req.body;

  if (!Array.isArray(packageIds) || packageIds.length === 0) {
    throw new ApiError(400, "Package IDs array is required");
  }

  if (!["sync", "delete"].includes(action)) {
    throw new ApiError(400, "Action must be sync or delete");
  }

  const results = {
    successful: [],
    failed: [],
  };

  for (const packageId of packageIds) {
    try {
      const packageDoc = await Package.findById(packageId);
      if (!packageDoc) {
        results.failed.push({
          packageId,
          error: "Package not found",
        });
        continue;
      }

      if (action === "sync") {
        // Sync logic here (similar to syncPackage)
        // ... implementation
      } else {
        // Delete logic here
        // ... implementation
      }

      results.successful.push(packageId);
    } catch (error) {
      results.failed.push({ packageId, error: error.message });
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, results, `Bulk ${action} operation completed`));
});

export {
  bulkSyncPackages,
  createPackage,
  deletePackage,
  getPackage,
  getPackages,
  getPackagesFromRouter,
  syncPackage,
  updatePackage,
};
