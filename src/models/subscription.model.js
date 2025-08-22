import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    planName: {
      // brounch, silver, gold, dimond
      type: String,
      required: true,
      trim: true,
    },
    maxClients: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    billingCycle: {
      type: String,
      default: "Monthly",
    },
    // belongs only to Admin
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    usedClients: {
      type: Number,
      default: 0, // total active clients under all resellers of this admin
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "suspended"],
      default: "active",
    },
  },
  { timestamps: true } // starting date is in it.
);

export const Subscription = model("Subscription", subscriptionSchema);
