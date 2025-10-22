import models, { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    status: {
      type: String,
      enum: ["active", "expired", "pending", "cancelled"],
      default: "pending",
    },
    maxResellers: {
      type: Number,
      default: 0,
    },
    maxUsers: {
      type: Number,
      default: 0,
    },
    maxRouters: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Subscription =
  models.Subscription || model("Subscription", subscriptionSchema);
