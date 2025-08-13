import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log(fullName, email, password);

  if (!fullName || !email || !password) {
    throw new ApiError(400, "All Fields are Required");
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(409, "Admin already exists");
  }

  const admin = await Admin.create({
    fullName,
    email,
    password,
  });

  const createdAdmin = await Admin.findById(admin._id).select("-password");
  if (!createdAdmin) {
    throw new ApiError(500, "Admin creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdAdmin, "Admin created successfully"));
});

export { registerAdmin };
