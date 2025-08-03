import { asyncHandler } from "../utils/asyncHandler.js";

// const createAdmin = asyncHandler(async (req, res) => {
//   try {
//     const { fullName, email, password } = req.body;

//     if ([fullName, email, password].some((field) => !field.trim() === "")) {
//       throw new ApiError(400, "All fields are required");
//     }

//     const admin = await Admin.create({ fullName, email, password });

//     return res
//       .status(200)
//       .json(new ApiResponse(200, admin, "✅ Admin created successfully"));
//   } catch (err) {
//     throw new ApiError(500, err.message);
//   }
// });

const registerAdmin = asyncHandler(async (req, res) => {
  return res.status(200).json({
    message: "ok",
  });
});

export { registerAdmin };
