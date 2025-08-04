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

const resellerPackageSchema = new Schema(
  {
    resellerId: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
    },
    packages: [packageSchema],
  },
  { timestamps: true }
);

export const ResellerPackage = model("ResellerPackage", resellerPackageSchema);
