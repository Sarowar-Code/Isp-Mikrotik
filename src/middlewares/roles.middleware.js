import { ApiError } from "../utils/ApiError.js";

export const requireRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    const role = req.authRole;
    if (!role || !allowedRoles.includes(role)) {
      throw new ApiError(403, "Forbidden");
    }
    next();
  };

export const requireAdmin = requireRoles("Admin", "SuperAdmin");
export const requireReseller = requireRoles("Reseller");
