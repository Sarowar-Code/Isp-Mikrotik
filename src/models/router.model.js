import { Schema, model } from "mongoose";

const routerSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    host: {
      type: String,
      required: true,
    }, // IP or domain
    port: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    }, // consider hashing/encrypting later
    assignedFor: {
      type: Schema.Types.ObjectId,
      ref: "Reseller", // optional: reseller using this router
      default: null,
    },
    vlanId: {
      type: Number,
      default: null, // optional VLAN ID if used
    },
    isActive: {
      type: Boolean,
      default: true,
    }, // if false, router is inactive
  },
  { timestamps: true }
);

export const Router = model("Router", routerSchema);
