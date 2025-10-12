import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { Reseller } from "../models/reseller.model.js";
import { SuperAdmin } from "../models/superAdmin.model.js";
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

    // decode without knowing secret first
    const decoded = jwt.decode(token);
    if (!decoded?.role) throw new ApiError(401, "Invalid Token - no role");

    let secret, Model;

    switch (decoded.role) {
      case "superadmin":
        secret = process.env.SUPERADMIN_ACCESS_TOKEN_SECRET;
        Model = SuperAdmin;
        break;
      case "admin":
        secret = process.env.ADMIN_ACCESS_TOKEN_SECRET;
        Model = Admin;
        break;
      case "reseller":
        secret = process.env.RESELLER_ACCESS_TOKEN_SECRET;
        Model = Reseller;
        break;

      default:
        throw new ApiError(401, "Invalid role");
    }

    // verify properly with correct secret
    const verified = jwt.verify(token, secret);

    const authUser = await Model.findById(verified._id).select(
      "-password -refreshToken"
    );
    if (!authUser) throw new ApiError(401, "AuthUser not found");

    req.auth = authUser;
    req.authRole = decoded.role;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid accessToken");
  }
});
