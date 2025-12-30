import express from "express";
import authenticate from "../../shared/middlewares/auth.middleware.js";
import optionalAuth from "../../shared/middlewares/optionalAuth.middleware.js";
import validate, {
  validateParams,
  validateQuery,
} from "../../shared/middlewares/validate.js";
import userController from "./user.controller.js";
import articleController from "../Article/article.controller.js";
import { updateProfileSchema } from "./user.validator.js";
import {
  usernameParamSchema,
  paginationQuerySchema,
} from "../Article/article.validator.js";
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

const { getMyArticles, getUserArticles } = articleController;

// ========== CURRENT USER ROUTES ==========

// Get current user's profile
router.get("/me", authenticate, getMyProfile);

// Update current user's profile
router.patch("/me", authenticate, validate(updateProfileSchema), updateProfile);

// Get current user's articles (all statuses)
// GET /api/v1/users/me/articles?status=draft&page=1&limit=10
router.get(
  "/me/articles",
  authenticate,
  validateQuery(paginationQuerySchema),
  getMyArticles
);

// ========== AVATAR ROUTES ==========

router.post(
  "/me/avatar",
  authenticate,
  avatarUpload.single("avatar"),
  handleMulterError,
  updateAvatar
);
router.delete("/me/avatar", authenticate, deleteAvatar);

// ========== COVER IMAGE ROUTES ==========

router.post(
  "/me/cover",
  authenticate,
  coverUpload.single("cover"),
  handleMulterError,
  updateCoverImage
);
router.delete("/me/cover", authenticate, deleteCoverImage);

// ========== PUBLIC ROUTES (param-based, must be last) ==========

// Get user's public profile
router.get("/:username", getPublicProfile);

// Get user's published articles
// GET /api/v1/users/:username/articles?page=1&limit=10
router.get(
  "/:username/articles",
  optionalAuth,
  validateParams(usernameParamSchema),
  validateQuery(paginationQuerySchema),
  getUserArticles
);

export default router;
