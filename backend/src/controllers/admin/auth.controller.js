import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.ts";
import { trimObject } from "../../services/trim.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { comparePassword } from "../../utils/auth.js";
import { cookieOptions } from "../../utils/cookieOptions.js";
import { generateAccessAndRefreshTokens } from "../../utils/generateTokens.js";

const loginAdmin = asyncHandler(async (req, res) => {
  const body = trimObject(req.body);

  const { email, password } = body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      password: true, // needed for validation
      contact: true,
      whatsapp: true,
      nid: true,
      role: true,
      address: true,
      paymentInfo: true,
      status: true,
    }
  });

  if (!admin) throw new ApiError(404, "Admin does not exist");

  const isPasswordValid = await comparePassword(password, admin.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid Admin Credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin);

  // Remove password before sending response
  const { password: _, ...adminData } = admin;

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { admin: adminData, accessToken, refreshToken }, "Admin logged in successfully"));
});


const logoutAdmin = asyncHandler(async (req, res) => {
  const adminId = req.auth?.id
  if (!adminId) {
    throw new ApiError(401, "Unauthorized request");
  }

  // Remove refresh token
  await prisma.admin.update({
    where: { id: adminId },
    data: { refreshToken: null },
  });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.ADMIN_REFRESH_TOKEN_SECRET);

    const admin = await prisma.admin.findUnique({
      where: { id: decodedToken.id }
    });

    if (!admin) throw new ApiError(401, "Invalid refresh token - Admin not found");
    if (admin.refreshToken !== incomingRefreshToken) throw new ApiError(401, "Refresh token expired or used");

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(admin);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));

  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});


export { loginAdmin, logoutAdmin, refreshAccessToken };
