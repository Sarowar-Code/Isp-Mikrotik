import { Schema, model } from "mongoose";

const routerSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      refPath: "ownerModel", // can be Admin or Reseller
      required: true,
    },
    ownerModel: {
      type: String,
      enum: ["Admin", "Reseller"],
      required: true,
    },
    host: {
      type: String,
      required: true,
    }, // IP or domain
    port: {
      type: Number,
      default: 8728,
    }, // MikroTik API default port
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    }, // better to encrypt/hash later
  },
  { timestamps: true }
);

export default model("Router", routerSchema);
