import { model, Schema } from "mongoose";

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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      default: "monthly",
    },

    // Technical / MikroTik
    bandwidthUp: {
      type: Number,
      required: true,
      min: 1,
    },
    bandwidthDown: {
      type: Number,
      required: true,
      min: 1,
    },
    mikrotikProfile: {
      type: String,
      required: true,
    },
    remoteAddressPool: {
      type: String,
      required: true, // name of the pool on the router
    },

    // Management
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

packageSchema.index({ resellerId: 1, name: 1 }, { unique: true });

export const Package = model("Package", packageSchema);
