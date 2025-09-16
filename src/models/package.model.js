import { Schema, model } from "mongoose";

const packageSchema = new Schema(
  {
    // References
    createdByAdmin: {
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
      // first create and assign router to reseller
      type: Schema.Types.ObjectId,
      ref: "Router",
      required: true,
    },

    // Identification
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Commercial

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

    // RouterOS Integration Fields
    routerosProfileName: {
      type: String,
      required: true,
    },
    localAddress: {
      type: String,
      default: "",
    },
    remoteAddressPool: {
      type: String,
      required: true,
    },
    dnsServer: {
      type: String,
      default: "",
    },
    winsServer: {
      type: String,
      default: "",
    },
    useEncryption: {
      type: String,
      enum: ["yes", "no", "required"],
      default: "no",
    },
    onlyOne: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    changeTcpMss: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    useCompression: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    useVjCompression: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    useUpnp: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    addressList: {
      type: String,
      default: "",
    },
    incomingFilter: {
      type: String,
      default: "",
    },
    outgoingFilter: {
      type: String,
      default: "",
    },
    sessionTimeout: {
      type: String,
      default: "0",
    },
    idleTimeout: {
      type: String,
      default: "0",
    },
    keepaliveTimeout: {
      type: String,
      default: "0",
    },

    // Bandwidth control (instead of bandwidthUp/down)
    rateLimit: { type: String, default: "" }, // Example: "2M/4M"

    // Sync Status
    syncStatus: {
      type: String,
      enum: ["synced", "pending", "failed", "not_synced"],
      default: "not_synced",
    },
    lastSyncAt: { type: Date, default: null },
  },
  { timestamps: true }
);

packageSchema.index({ resellerId: 1, name: 1 }, { unique: true });

export const Package = model("Package", packageSchema);
