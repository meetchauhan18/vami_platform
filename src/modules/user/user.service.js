import userRepository from "./user.repository.js";
import AppError from "../../shared/utils/AppError.js";

class UserService {
  constructor(UserRepository) {
    this.userRepository = UserRepository;
  }

  /**
   * Get user profile by username (public)
   */
  async getPublicProfile(username) {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw AppError.notFoundError("User not found");
    }

    return user;
  }

  /**
   * Get current user's own profile
   */
  async getMyProfile(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw AppError.notFoundError("User not found");
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User not found");
    }

    // Build update object with proper nested paths
    const updateData = {};

    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== undefined) {
        updateData[`profile.${key}`] = profileData[key];
      }
    });

    const updatedUser = await this.userRepository.update(userId, {
      $set: updateData,
    });
    return updatedUser;
  }

  async updateAvatar(userId, avatarData) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User not found");
    }

    // Get old avatar key for deletion (caller should handle S3 deletion)
    const oldAvatarKey = user.profile?.avatar?.key || null;

    const updatedUser = await this.userRepository.update(userId, {
      $set: { "profile.avatar": avatarData },
    });

    return { user: updatedUser, oldAvatarKey };
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User not found");
    }

    // Get old avatar key for deletion (caller should handle S3 deletion)
    const oldAvatarKey = user.profile?.avatar?.key || null;

    const updatedUser = await this.userRepository.update(userId, {
      $unset: { "profile.avatar": "" },
    });

    return { user: updatedUser, oldAvatarKey };
  }

  /**
   * Update user cover image
   */
  async updateCoverImage(userId, coverData) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User not found");
    }

    const oldCoverKey = user.profile?.coverImage?.key || null;

    const updatedUser = await this.userRepository.update(userId, {
      $set: { "profile.coverImage": coverData },
    });

    return { user: updatedUser, oldCoverKey };
  }

  /**
   * Delete user cover image
   */
  async deleteCoverImage(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User not found");
    }

    const oldCoverKey = user.profile?.coverImage?.key || null;

    const updatedUser = await this.userRepository.update(userId, {
      $unset: { "profile.coverImage": "" },
    });

    return { user: updatedUser, oldCoverKey };
  }
}

export default new UserService(userRepository);
