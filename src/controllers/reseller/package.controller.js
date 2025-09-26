import { Admin } from "../../models/admin.model.js";
import { Package } from "../../models/package.model.js";
import { Reseller } from "../../models/reseller.model.js";
import { routerOSService } from "../../services/routeros.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// get All profile from router then, create package by syncing
const createPackage = asyncHandler(async (req, res) => {
  const { routerId } = req.query;
  const {
    name,
    price,
    rateLimit,
    remoteAddress,
    localAddress,
    onlyOne,
    description,
    sessionTimeout,
    idleTimeout,
    billingCycle,
  } = req.body;

  if (
    !routerId ||
    !name ||
    !price ||
    !rateLimit ||
    !remoteAddress ||
    !localAddress
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const reseller = await Reseller.findById(req.auth._id);
  if (!reseller) {
    throw new ApiError(404, "Reseller not found");
  }

  const owner = await Admin.findById(reseller.adminId);
  if (!owner) {
    throw new ApiError(404, "Owner (Admin) not found");
  }

  const pkg = await Package.create({
    owner: owner._id,
    resellerId: reseller._id,
    mikrotikRouterId: routerId,
    name,
    price,
    rateLimit,
    remoteAddress,
    localAddress,
    onlyOne: onlyOne || "yes",
    description: description || "",
    sessionTimeout: sessionTimeout || "0",
    idleTimeout: idleTimeout || "0",
    billingCycle: billingCycle || "monthly",
    isActive: true,
    syncStatus: "synced",
    lastSyncAt: new Date(),
  });

  if (!pkg) {
    throw new ApiError(400, "Failed to create Package");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, pkg, "Package created successfully"));
});

const getAllPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({ resellerId: req.auth._id });

  if (!packages) {
    throw new ApiError(400, "failed to get packages");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, packages, "Packages Fetched Successfully"));
});

const updatePackage = asyncHandler(async (req, res) => {
  const {
    packageId,
    name,
    price,
    rateLimit,
    remoteAddress,
    localAddress,
    isActive,
    syncStatus,
  } = req.body;

  // 1. Find package
  const pkg = await Package.findById(packageId).populate("routerId");
  if (!pkg) {
    throw new ApiError(404, "Package not found");
  }

  // 2. Check ownership
  if (pkg.resellerId.toString() !== req.auth._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this Package");
  }

  // 3. Update in DB (local)
  if (name) pkg.name = name;
  if (price) pkg.price = price;
  if (rateLimit) pkg.rateLimit = rateLimit;
  if (remoteAddress) pkg.remoteAddress = remoteAddress;
  if (localAddress) pkg.localAddress = localAddress;
  if (isActive !== undefined) pkg.isActive = isActive;
  if (syncStatus !== undefined) pkg.syncStatus = syncStatus;

  await pkg.save();

  // 4. Update in MikroTik RouterOS
  try {
    if (pkg.routerId) {
      const ros = new routerOSService(pkg.routerId);
      await ros.connect();

      await ros.api(`/ppp/profile/set`, {
        ".id": pkg.routerProfileId, // must be stored when package was created
        name: pkg.name,
        rateLimit: pkg.rateLimit,
        localAddress: pkg.localAddress,
        remoteAddress: pkg.remoteAddress,
        // add other props if needed
      });

      pkg.lastSyncAt = new Date();
      pkg.syncError = "";
      await pkg.save();
    }
  } catch (err) {
    pkg.syncError = err.message;
    await pkg.save();
    throw new ApiError(500, `Router sync failed: ${err.message}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, pkg, "Package Updated & Synced Successfully"));
});

const deletePackage = asyncHandler(async (req, res) => {
  const { packageId } = req.query;

  const deletedPackage = await Package.findByIdAndDelete(packageId);

  if (!deletedPackage) {
    throw new ApiError(200, "", "Package deleted successfully");
  }
});

export { createPackage, deletePackage, getAllPackages, updatePackage };
