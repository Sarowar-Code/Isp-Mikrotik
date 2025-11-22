import mongoose from "mongoose";
import { Admin } from "../../models/admin.model.js";
import { PppClient } from "../../models/pppClient.model.js";
import { Reseller } from "../../models/reseller.model.js";
import { Router } from "../../models/router.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

const registerAdmin = asyncHandler(async (req, res) => {
  const {
    fullName,
    username,
    email,
    password,
    contact,
    whatsapp,
    nid,
    address,
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
  const existingAdmin = await Admin.findOne({
    $or: [{ email }, { username }],
  });
  if (existingAdmin) {
    throw new ApiError(409, "Admin with this email or username already exists");
  }

  // Handle avatar upload
  const avatarPath = req.file?.path;

  const avatar = avatarPath ? await uploadOnCloudinary(avatarPath) : null;

  // Create admin with the validated data
  const admin = await Admin.create({
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

  if (!admin) {
    // If creation fails for any reason (e.g., Mongoose validation), this will catch it
    throw new ApiError(400, "Failed to create admin");
  }

  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );
  if (!createdAdmin) {
    throw new ApiError(500, "Admin Creation Failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "Admin created successfully"));
});

const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, admins, "All admins fetched successfully"));
});

const getAdminsWithStats = asyncHandler(async (req, res) => {
  // Fetch all admins
  const admins = await Admin.find().select("-password -refreshToken");

  if (!admins || admins.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No admins found"));
  }

  // Aggregate stats for each admin
  const adminsWithStats = await Promise.all(
    admins.map(async (admin) => {
      const adminId = admin._id;

      // Count resellers assigned to this admin
      const resellerCount = await Reseller.countDocuments({
        adminId,
      });

      // Count routers owned by this admin
      const routerCount = await Router.countDocuments({
        owner: adminId,
      });

      // Count PPP clients whose admin is this admin (via reseller -> admin linkage)
      // PPP clients are created by resellers, so we need to count clients of resellers under this admin
      const resellerIds = await Reseller.find({ adminId }).select("_id");
      const resellerIdArray = resellerIds.map((r) => r._id);

      const pppClientCount = await PppClient.countDocuments({
        createdBy: { $in: resellerIdArray },
      });

      return {
        _id: admin._id,
        fullName: admin.fullName,
        username: admin.username,
        email: admin.email,
        contact: admin.contact,
        whatsapp: admin.whatsapp,
        nid: admin.nid,
        address: admin.address,
        avatar: admin.avatar,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
        stats: {
          totalResellers: resellerCount,
          totalRouters: routerCount,
          totalPppClients: pppClientCount,
        },
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, adminsWithStats, "Admins with stats fetched successfully"));
});

const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.query;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id?.trim())) {
    throw new ApiError(400, "Invalid Admin ID format");
  }

  // Find admin and exclude sensitive fields
  const admin = await Admin.findById(id.trim()).select(
    "-password -refreshToken"
  );

  if (!admin) {
    throw new ApiError(404, "Admin not found with the provided ID");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Admin fetched successfully"));
});

const deleteAdminById = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Admin ID");
  }

  const admin = await Admin.findByIdAndDelete(id);

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin deleted successfully"));
});

export { deleteAdminById, getAdminById, getAdminsWithStats, getAllAdmins, registerAdmin };
