import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";

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
    !nid ||
    !address?.thana ||
    !address?.houseName ||
    !address?.street ||
    !address?.district ||
    !address?.division
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingAdmin = await Admin.findOne({
    $or: [{ email }, { username }],
  });

  if (existingAdmin) {
    throw new ApiError(409, "Admin with this email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const avatar = avatarLocalPath
    ? await uploadOnCloudinary(avatarLocalPath)
    : null; // if avatar is provided, upload to Cloudinary

  const admin = await Admin.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password, // ✅ plain password (hashed by pre-save hook)
    avatar: avatar?.url || "",
    contact,
    whatsapp,
    nid,
    address: typeof address === "string" ? JSON.parse(address) : address,
  });

  if (!admin) {
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

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const admin = await Admin.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
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
    .json(new ApiResponse(200, loggedInAdmin, "Admin logged in successfully"));
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
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

const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, admins, "All admins fetched successfully"));
});

const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Admin ID");
  }

  // Find admin and exclude sensitive fields
  const admin = await Admin.findById(id).select("-password -refreshToken");

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Admin fetched successfully"));
});

const deleteAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;

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

const updateAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { fullName, username, email, contact, whatsapp, nid, address } =
    req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Admin ID");
  }

  const admin = await Admin.findById(id);
});

export { loginAdmin, logoutAdmin, registerAdmin };
