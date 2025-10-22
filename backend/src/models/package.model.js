import models, { Schema, model } from "mongoose";

const packageSchema = new Schema(
  {
    // References
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    resellerId: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
    },
    mikrotikRouterId: {
      type: Schema.Types.ObjectId,
      ref: "Router",
      required: true,
    },

    // RouterOS Integration (minimum required fields)
    name: {
      type: String,
      required: true,
      trim: true,
    },
    remoteAddress: {
      type: String,
      required: true,
    },
    localAddress: {
      type: String,
      required: true,
    },
    onlyOne: {
      type: String,
      enum: ["yes", "no"],
      default: "yes",
    },
    rateLimit: {
      type: String,
      default: "", // Example: "2M/4M"
    },

    // Commercial
    price: {
      type: Number,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "custom"],
      default: "monthly",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },

    // Timeouts (optional but common in ISP)
    sessionTimeout: {
      type: String,
      default: "0",
    },
    idleTimeout: {
      type: String,
      default: "0",
    },

    // Sync Status
    syncStatus: {
      type: String,
      enum: ["synced", "pending", "failed", "not_synced"],
      default: "synced",
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Unique package name per reseller
packageSchema.index({ resellerId: 1, name: 1 }, { unique: true });

export const Package = models.Package || model("Package", packageSchema);
