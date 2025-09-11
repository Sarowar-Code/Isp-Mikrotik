import { Reseller } from "../models/reseller.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import { generateAccessAndRefreshTokens } from "../utils/generateTokens.js";

const loginReseller = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const reseller = await Reseller.findOne({
    $or: [{ email }, { username: username?.toLowerCase() }],
  });

  if (!reseller) {
    throw new ApiError(404, "Reseller does not exist");
  }

  const isPasswordValid = await reseller.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Reseller Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    Reseller,
    reseller._id
  );

  const loggedInReseller = await Reseller.findById(reseller._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInReseller,
          accessToken,
          refreshToken,
        },
        "Reseller logged in successfully"
      )
    );
});

const logoutReseller = asyncHandler(async (req, res) => {
  await Reseller.findByIdAndUpdate(
    req.auth._id,
    {
      $unset: {
        refreshToken: 1, // Clear the refresh token in the database
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Reseller logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  console.log("incomingRefreshToken", incomingRefreshToken); // coming correctly

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.RESELLER_REFRESH_TOKEN_SECRET
    );

    const reseller = await Reseller.findById(decodedToken._id);

    if (!reseller) {
      throw new ApiError(401, "Invalid refresh token - Reseller not found");
    }

    if (reseller.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(Reseller, reseller._id);

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

const getCurrentReseller = asyncHandler(async (req, res) => {
  const reseller = await Reseller.findById(req.auth._id).select(
    "-password -refreshToken"
  );

  if (!reseller) {
    throw new ApiError(404, "Reseller not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, reseller, "Reseller fetched successfully"));
});

export {
  getCurrentReseller,
  loginReseller,
  logoutReseller,
  refreshAccessToken,
};
