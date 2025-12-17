import { prisma } from "../../lib/prisma.ts";
import { trimObject } from "../../services/trim.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getCurretAdmin = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.auth,
        "Current Admin details fetched successfully"
      )
    );
});

const updateAdminAccountDetails = asyncHandler(async (req, res) => {
  const body = trimObject(req.body);
  const { fullName, username, email, contact, whatsapp, nid, address } = body;

  let parsedAddress = null;

  // Parse address if it arrives as string
  if (typeof address === "string") {
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      throw new ApiError(400, "Invalid address format. Must be valid JSON.");
    }
  } else if (typeof address === "object" && address !== null) {
    parsedAddress = address;
  }

  // Build update fields
  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (username) updateFields.username = username.toLowerCase();
  if (email) updateFields.email = email;
  if (contact) updateFields.contact = contact;
  if (whatsapp) updateFields.whatsapp = whatsapp;
  if (nid) updateFields.nid = nid;

  const adminId = req.auth?.id;

  // Check if user exists
  const adminExists = await prisma.admin.findUnique({
    where: { id: adminId },
    include: { address: true },
  });

  if (!adminExists) {
    throw new ApiError(404, "Admin not found.");
  }

  // Check for duplicate username/email
  if (email || username) {
    const existing = await prisma.admin.findFirst({
      where: {
        AND: [
          { id: { not: adminId } },
          {
            OR: [
              email ? { email } : undefined,
              username ? { username: username.toLowerCase() } : undefined,
            ],
          },
        ],
      },
    });

    if (existing) {
      throw new ApiError(409, "Email or username already in use.");
    }
  }

  // Handle address update
  if (parsedAddress) {
    updateFields.address = {
      update: {
        ...parsedAddress,
      },
    };
  }

  // Update admin
  const updatedAdmin = await prisma.admin.update({
    where: { id: adminId },
    data: updateFields,
    include: { address: true, paymentInfo: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedAdmin, "Admin updated successfully"));
});

const updateAdminAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is missing");
  }

  // Upload new image
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Failed to upload avatar image");
  }

  // Get old avatar to remove it later
  const existingAdmin = await prisma.admin.findUnique({
    where: { id: req.auth?.id },
    select: { avatar: true },
  });

  if (!existingAdmin) {
    throw new ApiError(404, "Admin not found");
  }

  // Update avatar URL
  const updatedAdmin = await prisma.admin.update({
    where: { id: req.auth?.id },
    data: { avatar: avatar.url },
    select: {
      id: true,
      fullName: true,
      email: true,
      username: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });

  // OPTIONAL → Remove old cloudinary image
  if (existingAdmin.avatar) {
    try {
      await deleteFromCloudinary(existingAdmin.avatar);
    } catch (err) {
      console.log("Failed to delete old avatar:", err.message);
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedAdmin, "Admin image updated successfully")
    );
});

export { getCurretAdmin, updateAdminAccountDetails, updateAdminAvatar };
