import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const resellerSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
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
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      division: {
        type: String,
        required: true,
      },
    },
    avatar: {
      // it can be Logo/Profile picture
      type: String,
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      default: "Reseller",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

resellerSchema.plugin(mongooseAggregatePaginate);

// 🔒 Hash password before save

resellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

resellerSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: this.role.toLowerCase(),
    },
    process.env.RESELLER_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.RESELLER_ACCESS_TOKEN_EXPIRY,
    }
  );
};

resellerSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.RESELLER_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.RESELLER_REFRESH_TOKEN_EXPIRY,
    }
  );
};

resellerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Reseller = model("Reseller", resellerSchema);
