import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const walletSchema = new Schema(
  {
    resellerId: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    lastTopUp: {
      type: Date,
      default: Date.now,
    },
    lastBilling: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lowBalanceThreshold: {
      type: Number,
      default: 3000,
    },
  },
  { timestamps: true }
);

walletSchema.index({ resellerId: 1 });
walletSchema.index({ isActive: 1 });
walletSchema.index({ balance: 1 });

export const Wallet = models?.Wallet || model("Wallet", walletSchema);
