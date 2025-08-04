import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";

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
      required: true, // Placeholder
    },
    totalQuotaMB: {
      type: Number,
      required: true, // Total data assigned by Admin
    },
    usedQuotaMB: {
      type: Number,
      default: 0, // Used portion
    },
    refreshToken: {
      type: String,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    currentClientCount: {
      type: Number,
      default: 0,
    },
    subscriptionExpiry: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// 🔒 Hash password before save
resellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const Reseller = model("Reseller", resellerSchema);
