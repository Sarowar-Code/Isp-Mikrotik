import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { Reseller } from "../models/reseller.model.js";
import { Router } from "../models/router.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const admin = await Admin.findOne({
    $or: [{ email }, { username: username?.toLowerCase() }],
  });

  if (!admin) {
    throw new ApiError(404, "Admin does not exist");
  }

  const isPasswordValid = await admin.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Admin Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    Admin,
    admin._id
  );

  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInAdmin,
          accessToken,
          refreshToken,
        },
        "Admin logged in successfully"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.auth._id,
    {
      $unset: {
        refreshToken: 1, // Clear the refresh token in the database
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

const getCurretAdmin = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.auth,
        "Current Admin details fetched successfully"
      )
    );
});

const updateAdminAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, email, contact, whatsapp, nid, address } =
    req.body;

  let parsedAddress = null;
  if (typeof address === "string") {
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      throw new ApiError(400, "Invalid address format. Must be valid JSON.");
    }
  } else if (typeof address === "object" && address !== null) {
    parsedAddress = address;
  }

  // Build update object dynamically
  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (username) updateFields.username = username.toLowerCase();
  if (email) updateFields.email = email;
  if (contact) updateFields.contact = contact;
  if (whatsapp) updateFields.whatsapp = whatsapp;
  if (nid) updateFields.nid = nid;

  // Handle partial address update
  if (parsedAddress) {
    const adminDoc = await Admin.findById(req.auth?._id).select("address");
    if (!adminDoc) throw new ApiError(404, "Admin not found.");

    updateFields.address = {
      ...adminDoc.address.toObject(), // keep existing values
      ...parsedAddress, // overwrite only provided props
    };
  }

  // ✅ Check for duplicate email/username if updated
  if (email || username) {
    const existing = await Admin.findOne({
      $or: [{ email }, { username: username?.toLowerCase() }],
      _id: { $ne: req.auth?._id },
    });
    if (existing) {
      throw new ApiError(409, "Email or username already in use.");
    }
  }

  const admin = await Admin.findByIdAndUpdate(
    req.auth?._id,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken");

  if (!admin) throw new ApiError(404, "Admin not found.");

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Admin updated successfully"));
});

const updateAdminAvatar = asyncHandler(async (req, res) => {
  // take user details from frontend **/

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Failed to upload avatar image");
  }

  const admin = await Admin.findByIdAndUpdate(
    req.auth?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  // remove old avatar image from cloudinary
  // use utility funcitions
  return res
    .status(200)
    .json(new ApiResponse(200, admin, "admin image updated successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  console.log("incomingRefreshToken", incomingRefreshToken); // coming correctly

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ADMIN_REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findById(decodedToken._id);

    if (!admin) {
      throw new ApiError(401, "Invalid refresh token - Admin not found");
    }

    if (admin.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(Admin, admin._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken }, // returning accesstoken only,
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

// Router Management by Admin

const createRouter = asyncHandler(async (req, res) => {
  const { host, port, username, password, vlanId } = req.body;

  // Validate required fields
  if (!host || !username || !password) {
    throw new ApiError(400, "Host, username, and password are required");
  }

  const existingRouter = await Router.findOne({
    $or: [{ host }, { username }],
  });

  if (existingRouter) {
    throw new ApiError(409, "Router with this host or username already exists");
  }

  // Create router, initially unassigned
  const router = await Router.create({
    owner: req.auth._id, // admin who creates it
    host,
    port: port || 8728,
    username,
    password,
    vlanId: vlanId || null,
    assignedFor: null, // initially null
  });

  return res
    .status(201)
    .json(new ApiResponse(201, router, "Router created successfully"));
});

const assignRouterToReseller = asyncHandler(async (req, res) => {
  const { routerId, resellerId } = req.body;

  if (!routerId || !resellerId) {
    throw new ApiError(400, "routerId and resellerId are required");
  }

  const router = await Router.findById(routerId);

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  if (router.assignedFor) {
    throw new ApiError(400, "Router is already assigned to a reseller");
  }

  const updatedRouter = await Router.findByIdAndUpdate(
    router._id,
    { assignedFor: resellerId },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedRouter,
        "Router assigned to reseller successfully"
      )
    );
});

const unassignRouterFromReseller = asyncHandler(async (req, res) => {
  const { routerId } = req.body;

  if (!routerId) {
    throw new ApiError(400, "routerId is required");
  }

  const router = await Router.findById(routerId);

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  if (!router.assignedFor) {
    throw new ApiError(400, "Router is not assigned to any reseller");
  }

  const updatedRouter = await Router.findByIdAndUpdate(
    router._id,
    { assignedFor: null },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedRouter,
        "Router unassigned from reseller successfully"
      )
    );
});

const updateRouterDetails = asyncHandler(async (req, res) => {
  const { routerId, host, port, username, password, vlanId, isActive } =
    req.body;

  if (!routerId) {
    throw new ApiError(400, "routerId is required");
  }

  const router = await Router.findByIdAndUpdate(routerId, {
    $set: {
      host: host ? host : router.host,
      port: port ? port : router.port,
      username: username ? username : router.username,
      password: password ? password : router.password,
      vlanId: vlanId !== undefined ? vlanId : router.vlanId,
      isActive: isActive !== undefined ? isActive : router.isActive,
    },
  });

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, router, "Router updated successfully"));
});

const getRouterById = asyncHandler(async (req, res) => {
  const { routerId } = req.query;
  if (!routerId) {
    throw new ApiError(400, "routerId is required");
  }

  const router = await Router.findById(routerId);

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, router, "Router fetched successfully"));
});

const getAllRouters = asyncHandler(async (req, res) => {
  const routers = await Router.find({ owner: req.auth._id }); // only routers created by this admin.

  return res
    .status(200)
    .json(new ApiResponse(200, routers, "Routers fetched successfully"));
});

const deleteRouter = asyncHandler(async (req, res) => {
  const { routerId } = req.query;

  if (!routerId) {
    throw new ApiError(400, "routerId is required");
  }

  const router = await Router.findByIdAndDelete(routerId);

  if (!router) {
    throw new ApiError(404, "Router not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Router deleted successfully"));
});

// Reseller Management by Admin

const registerReseller = asyncHandler(async (req, res) => {
  const {
    fullName,
    username,
    email,
    password,
    contact,
    whatsapp,
    nid,
    address, // Mongoose will handle the validation of this object
  } = req.body;

  if (
    !fullName ||
    !username ||
    !email ||
    !password ||
    !contact ||
    !whatsapp ||
    !nid
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if admin with this email or username already exists
  const existingReseller = await Reseller.findOne({
    $or: [{ email }, { username }],
  });
  if (existingReseller) {
    throw new ApiError(
      409,
      "Reseller with this email or username already exists"
    );
  }

  // Handle avatar upload
  const avatarPath = req.file?.path;

  const avatar = avatarPath ? await uploadOnCloudinary(avatarPath) : null;

  const reseller = await Reseller.create({
    adminId: req.auth._id,
    fullName,
    username: username.toLowerCase(),
    email,
    password, // Hashed in pre-save hook
    avatar: avatar?.url || "",
    contact,
    whatsapp,
    nid,
    address: typeof address === "string" ? JSON.parse(address) : address, // The entire address object is passed here
  });

  if (!reseller) {
    // If creation fails for any reason (e.g., Mongoose validation), this will catch it
    throw new ApiError(400, "Failed to create Reseller");
  }

  const createdReseller = await Reseller.findById(reseller._id).select(
    "-password -refreshToken"
  );
  if (!createdReseller) {
    throw new ApiError(500, "Reseller Creation Failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdReseller, "Reseller created successfully")
    );
});

const getAllResellers = asyncHandler(async (req, res) => {
  const resellers = await Reseller.find({ adminId: req.auth._id }).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, resellers, "Resellers Fetched Successfully"));
});
export {
  assignRouterToReseller,
  createRouter,
  deleteRouter,
  getAllRouters,
  getCurretAdmin,
  getRouterById,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  unassignRouterFromReseller,
  updateAdminAccountDetails,
  updateAdminAvatar,
  updateRouterDetails,
};
