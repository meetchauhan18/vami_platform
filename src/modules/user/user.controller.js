import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import userService from "./user.service.js";

class UserController {
  constructor(UserService) {
    this.userService = UserService;
  }

  /**
   * GET /users/me - Get current user's profile
   */
  getMyProfile = asyncHandler(async (req, res) => {
    const user = await this.userService.getMyProfile(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * GET /users/:username - Get public profile
   */
  getPublicProfile = asyncHandler(async (req, res) => {
    const user = await this.userService.getPublicProfile(req.params.username);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * PATCH /users/me - Update profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const updatedUser = await this.userService.updateProfile(
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  });

  /**
   * POST /users/me/avatar - Upload avatar
   */
  updateAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    // TODO: Upload to S3/R2 and get { url, key }
    const avatarData = {
      url: req.file.path || req.file.location, // Adjust based on your upload middleware
      key: req.file.key || req.file.filename,
    };

    const { user } = await this.userService.updateAvatar(
      req.user._id,
      avatarData
    );

    // TODO: Delete old avatar from S3 using oldAvatarKey if needed

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: user,
    });
  });

  /**
   * DELETE /users/me/avatar - Delete avatar
   */
  deleteAvatar = asyncHandler(async (req, res) => {
    const { user, oldAvatarKey } = await this.userService.deleteAvatar(
      req.user._id
    );

    // TODO: Delete from S3 using oldAvatarKey if needed

    res.status(200).json({
      success: true,
      message: "Avatar deleted successfully",
      data: user,
    });
  });

  /**
   * POST /users/me/cover - Upload cover image
   */
  updateCoverImage = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    const coverData = {
      url: req.file.path || req.file.location,
      key: req.file.key || req.file.filename,
    };

    const { user } = await this.userService.updateCoverImage(
      req.user._id,
      coverData
    );

    res.status(200).json({
      success: true,
      message: "Cover image updated successfully",
      data: user,
    });
  });

  /**
   * DELETE /users/me/cover - Delete cover image
   */
  deleteCoverImage = asyncHandler(async (req, res) => {
    const { user } = await this.userService.deleteCoverImage(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cover image deleted successfully",
      data: user,
    });
  });
}

export default new UserController(userService);
