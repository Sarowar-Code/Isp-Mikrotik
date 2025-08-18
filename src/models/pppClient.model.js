import { Schema, model } from "mongoose";

const pppClientSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 5,
    },
    contact: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    nid: {
      type: Number,
      required: true,
    },
    address: {
      thana: {
        // as reseller
        type: String,
        required: true,
      },
      district: {
        // as reseller
        type: String,
        required: true,
      },
      division: {
        // as reseller
        type: String,
        required: true,
      },
    },
    clientType: {
      type: String,
      enum: ["home", "corporate"],
      default: "home",
      required: true,
    },
    connectionType: {
      type: String,
      enum: ["shared", "dedicated"],
      default: "shared",
      required: true,
    },
    macAddress: {
      type: String,
      trim: true,
      required: function () {
        return this.manualMac === true;
      },
    },
    manualMac: {
      type: Boolean,
      default: false, // false = auto-detect via MikroTik
    },
    userId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    service: {
      type: String,
      enum: ["pppoe", "hotspot", "dhcp", "static"],
      default: "pppoe",
      required: true,
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
  },

  { timestamps: true } // created at date is the clients signup date ,
);

export const PppClient = model("PppClient", pppClientSchema);
