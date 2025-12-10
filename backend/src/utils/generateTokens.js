import { prisma } from "../lib/prisma.ts";
import { ApiError } from "./ApiError.js";
import { generateAccessToken, generateRefreshToken } from "./auth.js";

// Mapping roles → prisma models
const roleModel = {
  superadmin: prisma.superAdmin,
  admin: prisma.admin,
  reseller: prisma.reseller,
};

export const generateAccessAndRefreshTokens = async (user) => {

  if (!user?.role) throw new ApiError(500, "User role missing");

  const model = roleModel[user.role.toLowerCase()];
  if (!model) throw new ApiError(500, "Invalid role");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refreshToken in its own model table
  await model.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
};
