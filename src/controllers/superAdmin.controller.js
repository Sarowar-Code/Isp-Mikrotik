import jwt from "jsonwebtoken";
import { SuperAdmin } from "../models/superAdmin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions } from "../utils/cookieOptions.js";

const generateAccessAndRefreshTokens = async (id) => {
  try {
    const superAdmin = await SuperAdmin.findById(id);

    if (!superAdmin) {
      throw new ApiError(404, "SuperAdmin not found");
    }

    const accessToken = superAdmin.generateAccessToken();
    const refreshToken = superAdmin.generateRefreshToken();

    superAdmin.refreshToken = refreshToken;
    await superAdmin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if ([fullName, email, password].some((field) => !field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // ✅ ensure only one SuperAdmin exists
  const existingSuperAdmin = await SuperAdmin.findOne();
  if (existingSuperAdmin) {
    throw new ApiError(409, "SuperAdmin already exists");
  }

  const superAdmin = await SuperAdmin.create({
    fullName,
    email,
    password,
  });

  const createdSuperAdmin = await SuperAdmin.findById(superAdmin._id).select(
    "-password"
  );

  if (!createdSuperAdmin) {
    throw new ApiError(500, "SuperAdmin creation failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdSuperAdmin, "SuperAdmin created successfully")
    );
});

const loginSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    throw new ApiError(400, "All fields are required");
  }

  const superAdmin = await SuperAdmin.findOne();

  if (!superAdmin) {
    throw new ApiError(404, "SuperAdmin does not exist");
  }

  const isPasswordValid = await superAdmin.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid superAdmin Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    superAdmin._id
  );

  const loggedInSuperAdmin = await SuperAdmin.findById(superAdmin._id).select(
    "-password -refreshToken"
  );

  const options = {
    // cookies options
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { superAdmin: loggedInSuperAdmin, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutSuperAdmin = asyncHandler(async (req, res) => {
  // clear cookies
  // clear tokens

  await SuperAdmin.findByIdAndUpdate(
    req.auth._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const getCurrentSuperAdmin = asyncHandler(async (req, res) => {
  // ** Get Current User Controller **/
  // return current user details from req.user **/
  // return response **

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.auth,
        "Current user details fetched successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  console.log(req.cookies);

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  console.log("incomingRefreshToken", incomingRefreshToken); // coming correctly

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.SUPERADMIN_REFRESH_TOKEN_SECRET
    );

    const superAdmin = await SuperAdmin.findById(decodedToken._id);

    if (!superAdmin) {
      throw new ApiError(401, "Invalid refresh token - superAdmin not found");
    }

    if (superAdmin.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(superAdmin._id);

    console.log("newRefreshToken", newRefreshToken); // showing undefined

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken }, // returning accesstoken only,
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

export {
  getCurrentSuperAdmin,
  loginSuperAdmin,
  logoutSuperAdmin,
  refreshAccessToken,
  registerSuperAdmin,
};
