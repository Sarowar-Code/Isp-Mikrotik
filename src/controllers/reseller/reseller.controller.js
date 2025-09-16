import { Reseller } from "../../models/reseller.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
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

export { getAllResellers, registerReseller };
