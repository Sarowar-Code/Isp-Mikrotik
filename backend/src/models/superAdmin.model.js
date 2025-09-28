import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { model, Schema } from "mongoose";

const superAdminSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 5,
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      default: "SuperAdmin",
    },
  },

  {
    timestamps: true,
  }
);

superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

superAdminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
    },
    process.env.SUPERADMIN_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.SUPERADMIN_ACCESS_TOKEN_EXPIRY,
    }
  );
};

superAdminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.SUPERADMIN_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.SUPERADMIN_REFRESH_TOKEN_EXPIRY,
    }
  );
};

superAdminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const SuperAdmin = model("SuperAdmin", superAdminSchema);
