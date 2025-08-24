import { SuperAdmin } from "../models/superAdmin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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

  const options = {
    // cookies options
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

export { loginSuperAdmin, logoutSuperAdmin, registerSuperAdmin };
