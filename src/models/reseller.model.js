import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";

const packageSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Friendly name in reseller panel
      trim: true,
    },
    mikrotikProfileName: {
      type: String,
      required: true, // Must match PPP profile name in MikroTik
      trim: true,
    },
    speedLimitUp: {
      type: String,
      required: true, // e.g., "5M"
    },
    speedLimitDown: {
      type: String,
      required: true, // e.g., "5M"
    },
    quotaMB: {
      type: Number,
      required: true, // Client data quota
    },
    price: {
      type: Number,
      required: true, // Reseller price for this package
    },
    validityDays: {
      type: Number,
      required: true, // Package validity period
    },
  },
  { _id: false }
);

const resellerSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
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
    avatar: {
      type: String,
      default: "https://example.com/default-avatar.png", // Default avatar if none
    },
    totalQuotaMB: {
      type: Number,
      required: true,
    },
    usedQuotaMB: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["Reseller"],
      default: "Reseller",
    },
    packages: [packageSchema], // Embedded custom packages
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Password hashing
resellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const Reseller = model("Reseller", resellerSchema);
