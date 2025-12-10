import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.ts";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Decode token without secret first
    const decoded = jwt.decode(token);
    if (!decoded?.role) throw new ApiError(401, "Invalid token - no role");

    let secret, user;

    const authRole = decoded.role.toLowerCase();

    switch (authRole) {
      case "superadmin":
        secret = process.env.SUPERADMIN_ACCESS_TOKEN_SECRET;
        user = await prisma.superAdmin.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        });
        break;

      case "admin":
        secret = process.env.ADMIN_ACCESS_TOKEN_SECRET;
        user = await prisma.admin.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        });
        break;

      case "reseller":
        secret = process.env.RESELLER_ACCESS_TOKEN_SECRET;
        user = await prisma.reseller.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        });
        break;

      default:
        throw new ApiError(401, "Invalid role");
    }

    if (!user) throw new ApiError(401, "Auth user not found");

    // Verify token properly with correct secret
    jwt.verify(token, secret);

    req.auth = user;
    req.authRole = decoded.role;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid accessToken");
  }
});
