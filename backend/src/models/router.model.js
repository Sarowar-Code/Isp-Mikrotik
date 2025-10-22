import models, { Schema, model } from "mongoose";

const routerSchema = new Schema(
  {
    // Ownership
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true, // must have an Admin who created it
    },
    assignedFor: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
      default: null, // reseller using this router
    },

    // Connection (RouterOS API)
    host: {
      type: String,
      required: true, // IP or domain
    },
    port: {
      type: Number,
      default: 8728,
      // MikroTik API default port
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true, // consider encrypting later
    },
    apiType: {
      type: String,
      enum: ["api", "ssl-api"],
      default: "api",
    },

    // Router Metadata (from RouterOS)
    identity: {
      type: String,
      default: "",
    },
    version: {
      type: String,
      default: "",
    },
    board: {
      type: String,
      default: "",
    },
    uptime: {
      type: String,
      default: "",
    },
    // VLAN Support (if used)
    vlanId: {
      type: Number,
      default: null,
    },
    // Monitoring
    isActive: {
      type: Boolean,
      default: true, // router is enabled
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    syncError: {
      type: String,
      default: "",
    },
    // Notes
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Router = models.Router || model("Router", routerSchema);
