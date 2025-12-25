import express from "express";
import authenticate from "../../shared/middlewares/auth.middleware.js";
import validate from "../../shared/middlewares/validate.js";
import userController from "./user.controller.js";
import { updateProfileSchema } from "./user.validator.js";
import {
  avatarUpload,
  coverUpload,
  handleMulterError,
} from "../../shared/utils/upload.js";

const router = express.Router();

const {
  getMyProfile,
  getPublicProfile,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  updateCoverImage,
  deleteCoverImage,
} = userController;

// Current user routes
router.get("/me", authenticate, getMyProfile);
router.patch("/me", authenticate, validate(updateProfileSchema), updateProfile);

// Avatar routes (with multer error handling)
router.post(
  "/me/avatar",
  authenticate,
  avatarUpload.single("avatar"),
  handleMulterError,
  updateAvatar
);
router.delete("/me/avatar", authenticate, deleteAvatar);

// Cover image routes (with multer error handling)
router.post(
  "/me/cover",
  authenticate,
  coverUpload.single("cover"),
  handleMulterError,
  updateCoverImage
);
router.delete("/me/cover", authenticate, deleteCoverImage);

// Public profile route (must be last due to :username param)
router.get("/:username", getPublicProfile);

export default router;
