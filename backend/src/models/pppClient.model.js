import models, { Schema, model } from "mongoose";

const pppClientSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
    },
    name: {
      // same as router
      type: String,
      required: true,
      trim: true,
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
        type: String,
        required: true, // as Reseller
      },
      houseName: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true, // as Reseller
      },
      division: {
        type: String,
        required: true, // as Reseller
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
    service: {
      type: String,
      enum: ["pppoe", "hotspot", "dhcp", "static"],
      default: "pppoe",
    },
    macAddress: {
      type: String,
      default: "",
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    packageName: {
      type: String,
      default: "",
    },
    paymentInfo: {
      monthlyFee: {
        type: Number,
        default: 0,
      },
      lastPaymentDate: {
        type: Date,
      },
      nextPaymentDue: {
        type: Date,
      },
      paymentStatus: {
        type: String,
        enum: ["Paid", "Pending", "Overdue"],
        default: "Pending",
      },
    },
    // RouterOS Integration Fields
    routerId: {
      type: Schema.Types.ObjectId,
      ref: "Router",
      required: true,
    },
    isEnableOnRouter: {
      type: Boolean,
      default: false,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    syncStatus: {
      // synced From router nad save in db,
      type: String,
      enum: ["synced", "notSynced"],
      default: "synced",
    },
  },

  { timestamps: true } // created at date is the clients signup date ,
);

export const PppClient =
  models.PppClient || model("PppClient", pppClientSchema);
