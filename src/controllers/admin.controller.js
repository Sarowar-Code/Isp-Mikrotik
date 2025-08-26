import { asyncHandler } from "../utils/asyncHandler.js";

const registerAdmin = asyncHandler(async (req, res) => {
  const {
    fullName,
    username,
    email,
    password,
    contact,
    whatsapp,
    nid,
    address,
    router,
  } = req.body;

  if (
    !fullName ||
    !username ||
    !email ||
    !password ||
    !contact ||
    !whatsapp ||
    !nid ||
    !address?.thana ||
    !address?.houseName ||
    !address?.street ||
    !address?.district ||
    !address?.division ||
  ) {
    throw ApiError(404, "All feilds are required");
  }
  if (
    !router.ownerModel ||
    !router.host ||
    !router.username ||
    !router.password ||
    !router.port
  ) {
    throw ApiError(404, "Reuter all feilds are required");
  }
});
