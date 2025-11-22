import models, { model, Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    // Who paid
    payerId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "payerModel",
    },
    payerModel: {
      type: String,
      enum: ["Admin", "Reseller"],
      required: true,
    },

    // Who received
    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "receiverModel",
    },
    receiverModel: {
      type: String,
      enum: ["Admin", "SuperAdmin"],
      required: true,
    },

    // Plan references
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: function () {
        return this.payerModel === "Admin";
      },
    },
    packages: [
      {
        packageId: {
          type: Schema.Types.ObjectId,
          ref: "Package",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        userCount: {
          type: Number,
          default: 0,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    // Payment info
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "manual"],
      default: "manual",
    },
    paymentMethodRef: {
      type: String,
      trim: true,
      index: true, // for trxId or agentRef search
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "due"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    // Who confirmed it
    confirmedBy: {
      type: Schema.Types.ObjectId,
      refPath: "receiverModel",
    },
  },
  { timestamps: true }
);

// Indexing for faster queries
paymentSchema.index({ payerId: 1 }); // for admin search
paymentSchema.index({ receiverId: 1 }); // for superadmin search
paymentSchema.index({ status: 1 }); // for status search

export const Payment = models.Payment || model("Payment", paymentSchema);
