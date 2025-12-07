import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.ts";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { comparePassword, hashPassword } from "../../utils/auth.js";
import { cookieOptions } from "../../utils/cookieOptions.js";
import { generateAccessAndRefreshTokens } from "../../utils/generateTokens.js";

const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if ([fullName, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // allow only one SuperAdmin
  const existing = await prisma.superAdmin.findFirst();
  if (existing) {
    throw new ApiError(409, "SuperAdmin already exists");
  }

  const hashedPassword = await hashPassword(password);

  const newAdmin = await prisma.superAdmin.create({
    data: { fullName, email, password: hashedPassword },
  });

  const created = await prisma.superAdmin.findUnique({
    where: { id: newAdmin.id },
    select: { id: true, fullName: true, email: true, role: true },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, created, "SuperAdmin created successfully"));
});

const loginSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // 2. Find admin by email
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { email },
  });

  if (!superAdmin) {
    throw new ApiError(404, "SuperAdmin does not exist");
  }

  // 3. Password check
  const isPasswordValid = await comparePassword(password, superAdmin.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 4. Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(superAdmin);

  // 5. Save refreshToken in DB
  await prisma.superAdmin.update({
    where: { id: superAdmin.id },
    data: { refreshToken },
  });

  // 6. Prepare safe response object
  const adminForResponse = {
    id: superAdmin.id,
    fullName: superAdmin.fullName,
    email: superAdmin.email,
    role: superAdmin.role,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { superAdmin: adminForResponse, accessToken, refreshToken },
        "Admin logged in successfully"
      )
    );
});

const logoutSuperAdmin = asyncHandler(async (req, res) => {
  const superAdminId = req.auth?.id; // or req.user?.id depending on your auth middleware

  if (!superAdminId) {
    throw new ApiError(401, "Unauthorized request");
  }

  // Remove refresh token
  await prisma.superAdmin.update({
    where: { id: superAdminId },
    data: { refreshToken: null },
  });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const getCurrentSuperAdmin = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.auth,
        "Current SuperAdmin details fetched successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.SUPERADMIN_REFRESH_TOKEN_SECRET
    );

    // Find user by decoded.id
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: decoded.id },
    });

    if (!superAdmin) {
      throw new ApiError(401, "Invalid refresh token - user not found");
    }

    // Check if incoming refresh matches DB
    if (superAdmin.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or already used");
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(superAdmin);

    // Send new tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    console.error(error);
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

export {
  getCurrentSuperAdmin,
  loginSuperAdmin,
  logoutSuperAdmin,
  refreshAccessToken,
  registerSuperAdmin
};
