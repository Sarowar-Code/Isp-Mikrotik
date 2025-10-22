import models, { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    payerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "payerModel",
    },
    payerModel: {
      type: String,
      required: true,
      enum: ["Admin", "Reseller"],
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: function () {
        return this.payerModel === "Admin"; // Editable
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "due"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["bkash", "manual"],
      default: "bkash",
    },
    paidAt: {
      type: Date,
    },
    nextDueDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

paymentSchema.pre("save", async function (next) {
  if (this.isModified("paidAt") && this.subscriptionId) {
    const Subscription = (await import("./subscription.model.js")).Subscription;
    const sub = await Subscription.findById(this.subscriptionId);

    if (sub) {
      const nextDue = new Date(this.paidAt);
      if (sub.billingCycle === "monthly")
        nextDue.setMonth(nextDue.getMonth() + 1);
      if (sub.billingCycle === "yearly")
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      this.nextDueDate = nextDue;
    }
  }
  next();
});

export const Payment = models.Payment || model("Payment", paymentSchema);
