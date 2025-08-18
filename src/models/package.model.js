import { model, Schema } from "mongoose";

const packageSchema = new Schema(
  {
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
    // Identification
    name: {
      type: String,
      required: true,
    },
    // Commercial
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    billingCycle: {
      type: String,
      default: "monthly",
    },
    validityDays: { type: Number, default: 30 },

    // Technical
    bandwidthUp: {
      type: Number,
      required: true,
    }, // Mbps
    bandwidthDown: {
      type: Number,
      required: true,
    }, // Mbps
    mikrotikProfile: {
      type: String,
      required: true,
    },

    // Management
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Package = model("Package", packageSchema);
