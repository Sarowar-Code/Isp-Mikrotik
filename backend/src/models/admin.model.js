import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import models, { Schema, model } from "mongoose";

const adminSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
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
    avatar: {
      type: String,
    },
    contact: {
      type: String,
      required: true,
      index: true,
    },
    whatsapp: {
      type: String,
      required: true,
      index: true,
    },
    nid: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      thana: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      division: {
        type: String,
        required: true,
      },
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      default: "Admin",
    },
    paymentInfo: {
      monthlyFee: {
        type: Number,
        default: 0,
      },
      lastPaymentDate: {
        type: Date,
      },
      nextPaymentDue: {
        type: Date,
      },
      paymentStatus: {
        type: String,
        enum: ["Paid", "Pending", "Overdue"],
        default: "Pending",
      },
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: this.role.toLowerCase(),
    },
    process.env.ADMIN_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRY,
    }
  );
};

adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.ADMIN_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRY,
    }
  );
};

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Admin = models.Admin || model("Admin", adminSchema);
