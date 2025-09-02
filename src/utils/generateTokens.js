export const generateAccessAndRefreshTokens = async (model, id) => {
  try {
    const user = await model.findById(id);

    if (!user) {
      throw new ApiError(404, `${model.modelName} not found`);
    }

    // Instance methods (defined in schema.methods)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in DB for this admin
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};
