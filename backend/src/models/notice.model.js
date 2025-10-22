import models, { Schema, model } from "mongoose";

const noticeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    noticeFor: {
      type: String,
      enum: ["Admin", "Reseller", "global"],
      required: true,
      default: "global",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SuperAdmin", // Who created the notice (optional)
    },
  },
  { timestamps: true }
);

export const Notice = models.Notice || model("Notice", noticeSchema);
