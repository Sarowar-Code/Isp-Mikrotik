import { RouterOSAPI } from "node-routeros";
import { Package } from "../../models/package.model.js";
import { PppClient } from "../../models/pppClient.model.js";
import { Router } from "../../models/router.model.js";
import { routerOSService } from "../../services/routeros.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
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

const createPppClient = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    contact,
    whatsapp,
    nid,
    address,
    clientType,
    connectionType,
    packageId,
    paymentDeadline,
    routerId,
    packageName = "",
    service = "pppoe", // default
  } = req.body;

  // 1️⃣ Validate required fields
  if (
    !name ||
    !email ||
    !password ||
    !contact ||
    !whatsapp ||
    !nid ||
    !address ||
    !clientType ||
    !connectionType ||
    !packageId ||
    !paymentDeadline ||
    !routerId
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2️⃣ Check duplicates (DB)
  const existingClient = await PppClient.findOne({
    routerId,
    $or: [{ email }, { name }],
  });
  if (existingClient) {
    throw new ApiError(
      400,
      "Client with this email or name already exists on this router"
    );
  }

  // 3️⃣ Prepare address
  const setAddress = {
    thana: req.auth.address.thana,
    district: req.auth.address.district,
    division: req.auth.address.division,
    houseName: address.houseName,
    street: address.street,
  };

  // 4️⃣ Validate package & router
  const pkg = await Package.findById(packageId);
  if (!pkg) throw new ApiError(404, "Package not found");

  await assertPackageOwnedByReseller(packageId, req.auth._id);
  // const router = await assertRouterAssignedToReseller(routerId, req.auth._id);

  const router = await Router.findById(routerId);

  // 5️⃣ Create on RouterOS first
  try {
    const client = new RouterOSAPI({
      host: router.host,
      user: router.username,
      password: router.password,
      port: router.port || 8728,
    });

    await client.connect();

    await client.write([
      "/ppp/secret/add",
      `=name=${name}`,
      `=password=${password}`,
      `=profile=${pkg.name || packageName}`,
      `=service=${service}`,
      `=comment=${name} - ${email}`,
    ]);

    await client.close();
  } catch (err) {
    throw new ApiError(
      500,
      `Failed to create PPP secret on router: ${err.message}`
    );
  }

  // 6️⃣ Only if router success → Create DB record
  const pppClient = await PppClient.create({
    createdBy: req.auth._id,
    name,
    email,
    password,
    contact,
    whatsapp,
    nid,
    address: setAddress,
    clientType,
    connectionType,
    service,
    packageId,
    packageName: pkg.name || packageName,
    routerId,
    paymentDeadline,
    isEnableOnRouter: true,
    syncStatus: "synced",
    lastSyncAt: new Date(),
  });

  // 7️⃣ Response
  return res
    .status(201)
    .json(new ApiResponse(201, pppClient, "PPP Client created successfully"));
});

const updatePppClient = asyncHandler(async (req, res) => {
  const { clientId } = req.query;
  const {
    name,
    username,
    email,
    password,
    contact,
    whatsapp,
    nid,
    address,
    clientType,
    connectionType,
    packageId,
    paymentDeadline,
    routerId,
    service = "pppoe",
    isEnableOnRouter,
  } = req.body;

  // 1️⃣ Find client
  const pppClient = await PppClient.findById(clientId);
  if (!pppClient) {
    throw new ApiError(404, "PPP Client not found");
  }

  // 2️⃣ Ownership check
  if (pppClient.createdBy.toString() !== req.auth._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this Client");
  }

  // 3️⃣ Update only provided fields
  if (name) pppClient.name = name;
  if (username) pppClient.username = username;
  if (email) pppClient.email = email;
  if (password) pppClient.password = password;
  if (contact) pppClient.contact = contact;
  if (whatsapp) pppClient.whatsapp = whatsapp;
  if (nid) pppClient.nid = nid;
  if (address) pppClient.address = address;
  if (clientType) pppClient.clientType = clientType;
  if (connectionType) pppClient.connectionType = connectionType;
  if (packageId) pppClient.packageId = packageId;
  if (paymentDeadline) pppClient.paymentDeadline = paymentDeadline;
  if (routerId) pppClient.routerId = routerId;
  if (service) pppClient.service = service;
  if (isEnableOnRouter !== undefined)
    pppClient.isEnableOnRouter = isEnableOnRouter;

  // 4️⃣ Save to DB first
  await pppClient.save();

  // 5️⃣ Sync to RouterOS if enabled
  if (pppClient.isEnableOnRouter) {
    try {
      const command = [
        "/ppp/secret/set",
        `=.id=${pppClient.username}`, // or use RouterOS internal ID if you sync that
        `=name=${pppClient.username}`,
        `=password=${pppClient.password}`,
        `=profile=${pppClient.packageId}`, // map to profile name
        `=service=${pppClient.service}`,
        `=comment=${pppClient.name} - ${pppClient.email}`,
      ];

      await routerOSService.executeCommand(pppClient.routerId, command);

      pppClient.syncStatus = "synced";
      pppClient.lastSyncAt = new Date();
      await pppClient.save();
    } catch (error) {
      pppClient.syncStatus = "notSynced";
      await pppClient.save();
      throw new ApiError(
        500,
        `Failed to update PPP client on router: ${error.message}`
      );
    }
  }

  // 6️⃣ Response
  return res
    .status(200)
    .json(new ApiResponse(200, pppClient, "PPP Client updated successfully"));
});

export { createPppClient, getAllPppProfiles, updatePppClient };
