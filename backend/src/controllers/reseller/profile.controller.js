// Update resellers Accounts details, avatar
import { Reseller } from "../../models/reseller.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getCurretReseller = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.auth,
        "Current Reseller details fetched successfully"
      )
    );
});

const updateResellerAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, email, contact, whatsapp, nid, address } =
    req.body;

  let parsedAddress = null;
  if (typeof address === "string") {
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      throw new ApiError(400, "Invalid address format. Must be valid JSON.");
    }
  } else if (typeof address === "object" && address !== null) {
    parsedAddress = address;
  }

  // Build update object dynamically
  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (username) updateFields.username = username.toLowerCase();
  if (email) updateFields.email = email;
  if (contact) updateFields.contact = contact;
  if (whatsapp) updateFields.whatsapp = whatsapp;
  if (nid) updateFields.nid = nid;

  // Handle partial address update
  if (parsedAddress) {
    const resellerDoc = await Reseller.findById(req.auth?._id).select(
      "address"
    );
    if (!resellerDoc) throw new ApiError(404, "Admin not found.");

    updateFields.address = {
      ...resellerDoc.address.toObject(), // keep existing values
      ...parsedAddress, // overwrite only provided props
    };
  }

  // ✅ Check for duplicate email/username if updated
  if (email || username) {
    const existing = await Reseller.findOne({
      $or: [{ email }, { username: username?.toLowerCase() }],
      _id: { $ne: req.auth?._id },
    });
    if (existing) {
      throw new ApiError(409, "Email or username already in use.");
    }
  }

  const reseller = await Reseller.findByIdAndUpdate(
    req.auth?._id,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken");

  if (!reseller) throw new ApiError(404, "Reseller not found.");

  return res
    .status(200)
    .json(new ApiResponse(200, reseller, "Reseller updated successfully"));
});

const updateResellerAvatar = asyncHandler(async (req, res) => {
  // take user details from frontend **/

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Failed to upload avatar image");
  }

  const reseller = await Reseller.findByIdAndUpdate(
    req.auth?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  // remove old avatar image from cloudinary
  // use utility funcitions
  return res
    .status(200)
    .json(new ApiResponse(200, reseller, "admin image updated successfully"));
});

export {
  getCurretReseller,
  updateResellerAccountDetails,
  updateResellerAvatar,
};
