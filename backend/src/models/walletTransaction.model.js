import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const walletTransactionSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    resellerId: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["recharge", "withdraw"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bkash", "nagad", "bank", "manual"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ resellerId: 1, transactionDate: -1 });
walletTransactionSchema.index({ status: 1, transactionDate: -1 });

export const WalletTransaction =
  models?.WalletTransaction ||
  model("WalletTransaction", walletTransactionSchema);
