import models, { Schema, model } from "mongoose";

const paymentResetSchema = new Schema(
  {
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    payerId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "payerModel",
    },
    payerModel: {
      type: String,
      required: true,
      enum: ["Admin", "Reseller", "User"],
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    routerId: {
      type: Schema.Types.ObjectId,
      ref: "Router",
      required: function () {
        return this.payerModel === "Reseller";
      },
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: function () {
        return this.payerModel === "User";
      },
    },
    reason: {
      type: String,
      trim: true,
      enum: ["subscription", "router", "package"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const PaymentReset =
  models.PaymentReset || model("PaymentReset", paymentResetSchema);
