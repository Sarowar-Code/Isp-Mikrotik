import { prisma } from "../../lib/prisma.ts";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { hashPassword } from "../../utils/auth.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

const registerAdmin = asyncHandler(async (req, res) => {
  const {
    fullName,
    username,
    email,
    password,
    contact,
    whatsapp,
    nid,
    address
  } = req.body;

  // basic validation
  if (!fullName || !username || !email || !password ||
      !contact || !whatsapp || !nid)
    throw new ApiError(400, "All fields are required");

  // check if email or username exists
  const existing = await prisma.admin.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });

  if (existing)
    throw new ApiError(409, "Admin with this email or username already exists");

  // avatar upload
  const avatarPath = req.file?.path;
  const avatar = avatarPath ? await uploadOnCloudinary(avatarPath) : null;

  // hash password
  const hashedPassword = await hashPassword(password)

  // Parse address if string
  const parsedAddress =
    typeof address === "string" ? JSON.parse(address) : address;

  // Create Admin
  const admin = await prisma.admin.create({
    data: {
      fullName,
      username: username.toLowerCase(),
      email,
      password: hashedPassword,
      avatar: avatar?.url || "",
      contact,
      whatsapp,
      nid,

      // create related address (one-to-one)
      address: {
        create: {
          thana: parsedAddress.thana,
          district: parsedAddress.district,
          division: parsedAddress.division
        }
      },

      // create paymentInfo with defaults
      paymentInfo: {
        create: {}
      }
    },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      avatar: true,
      contact: true,
      whatsapp: true,
      nid: true,
      status: true,
      role: true,
      address: true,
      paymentInfo: true,
      createdAt: true
    }
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, admin, "Admin created successfully")
    );
});

const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await prisma.admin.findMany({
    select: {
      id:true,
      fullName:true,
      username:true,
      email:true,
      contact:true,
      whatsapp:true,
      nid:true,
      address:true,
      paymentInfo:true,
      status:true,
    }
  })
  return res
    .status(200)
    .json(new ApiResponse(200, admins, "All admins fetched successfully"));
});

// const getAdminsWithStats = asyncHandler(async (req, res) => {
//   // Fetch all admins
//   const admins = await Admin.find().select("-password -refreshToken");

//   if (!admins || admins.length === 0) {
//     return res
//       .status(200)
//       .json(new ApiResponse(200, [], "No admins found"));
//   }

//   // Aggregate stats for each admin
//   const adminsWithStats = await Promise.all(
//     admins.map(async (admin) => {
//       const adminId = admin._id;

//       // Count resellers assigned to this admin
//       const resellerCount = await Reseller.countDocuments({
//         adminId,
//       });

//       // Count routers owned by this admin
//       const routerCount = await Router.countDocuments({
//         owner: adminId,
//       });

//       // Count PPP clients whose admin is this admin (via reseller -> admin linkage)
//       // PPP clients are created by resellers, so we need to count clients of resellers under this admin
//       const resellerIds = await Reseller.find({ adminId }).select("_id");
//       const resellerIdArray = resellerIds.map((r) => r._id);

//       const pppClientCount = await PppClient.countDocuments({
//         createdBy: { $in: resellerIdArray },
//       });

//       return {
//         _id: admin._id,
//         fullName: admin.fullName,
//         username: admin.username,
//         email: admin.email,
//         contact: admin.contact,
//         whatsapp: admin.whatsapp,
//         nid: admin.nid,
//         address: admin.address,
//         avatar: admin.avatar,
//         isActive: admin.isActive,
//         createdAt: admin.createdAt,
//         updatedAt: admin.updatedAt,
//         stats: {
//           totalResellers: resellerCount,
//           totalRouters: routerCount,
//           totalPppClients: pppClientCount,
//         },
//       };
//     })
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, adminsWithStats, "Admins with stats fetched successfully"));
// });

const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.query;

  // Validate MongoDB ObjectId
   if (!id || typeof id !== "string") {
    throw new ApiError(400, "Invalid ID");
  }

  // Find admin and exclude sensitive fields
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: {
      id:true,
      fullName:true,
      username:true,
      email:true,
      contact:true,
      whatsapp:true,
      nid:true,
      address:true,
      paymentInfo:true,
      status:true,
    }
  })

  if (!admin) {
    throw new ApiError(404, "Admin not found with the provided ID");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Admin fetched successfully"));
});

const deleteAdminById = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    throw new ApiError(400, "Invalid ID");
  }

  // Check if admin exists
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new ApiError(404, "Admin not found");

  try {
    await prisma.admin.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Admin deleted successfully"));

  } catch (error) {
    throw error; // Prisma cascade errors will be thrown automatically
  }
});



export { deleteAdminById, getAdminById, getAllAdmins, registerAdmin };
