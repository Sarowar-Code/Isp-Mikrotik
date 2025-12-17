import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// ---------- PASSWORD FUNCTIONS ----------


export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

// ---------- TOKEN FUNCTIONS ----------

/**
 * Generate Access Token for any user role
 */
export const generateAccessToken = (user) => {
  const secret = {
    SuperAdmin: process.env.SUPERADMIN_ACCESS_TOKEN_SECRET,
    Admin: process.env.ADMIN_ACCESS_TOKEN_SECRET,
    Reseller: process.env.RESELLER_ACCESS_TOKEN_SECRET,
  }[user.role];

  const expiry = {
    SuperAdmin: process.env.SUPERADMIN_ACCESS_TOKEN_EXPIRY || "15m",
    Admin: process.env.ADMIN_ACCESS_TOKEN_EXPIRY || "30m",
    Reseller: process.env.RESELLER_ACCESS_TOKEN_EXPIRY || "30m",
  }[user.role];

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    secret,
    { expiresIn: expiry }
  );
};

/**
 * Generate Refresh Token for any user role
 */
export const generateRefreshToken = (user) => {
  const secret = {
    SuperAdmin: process.env.SUPERADMIN_REFRESH_TOKEN_SECRET,
    Admin: process.env.ADMIN_REFRESH_TOKEN_SECRET,
    Reseller: process.env.RESELLER_REFRESH_TOKEN_SECRET,
  }[user.role];

  const expiry = {
    SuperAdmin: process.env.SUPERADMIN_REFRESH_TOKEN_EXPIRY || "7d",
    Admin: process.env.ADMIN_REFRESH_TOKEN_EXPIRY || "7d",
    Reseller: process.env.RESELLER_REFRESH_TOKEN_EXPIRY || "7d",
  }[user.role];

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    secret,
    { expiresIn: expiry }
  );
};
