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
        userId: {
            type: String,
            unique: true,
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
        paymentDeadline: {
            type: Date,
            required: true,
        },

        // RouterOS Integration Fields
        routerId: {
            type: Schema.Types.ObjectId,
            ref: "Router",
            required: true,
        },
        routerosProfile: {
            type: String,
            required: true,
        },
        routerosSecretId: {
            type: String,
            default: "",
        },
        isActiveOnRouter: {
            type: Boolean,
            default: false,
        },
        lastSyncAt: {
            type: Date,
            default: null,
        },
        syncStatus: {
            type: String,
            enum: ["synced", "pending", "failed", "not_synced"],
            default: "not_synced",
        },
        syncError: {
            type: String,
            default: "",
        },
        routerosData: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },

    { timestamps: true } // created at date is the clients signup date ,
);

export const PppClient = model("PppClient", pppClientSchema);
