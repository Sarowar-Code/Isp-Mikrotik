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
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role || "SuperAdmin",
    },
    process.env.SUPERADMIN_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.SUPERADMIN_ACCESS_TOKEN_EXPIRY || "15m",
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role || "SuperAdmin",
    },
    process.env.SUPERADMIN_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.SUPERADMIN_REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};
