import { Router } from "express";
import { registerAdmin } from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
  upload.single({
    name: "avatar",
    maxCount: 1,
  }),
  registerAdmin
);
