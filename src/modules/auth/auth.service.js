import userRepository from "../user/user.repository.js";
import refreshTokenRepository from "./refresh-token.repository.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateAccessToken } from "../../shared/utils/jwt.utils.js";
import AppError from "../../shared/utils/AppError.js";
import logger from "../../shared/utils/logger.js";
import emailService from "../../shared/services/email.service.js";
import { TOKEN_EXPIRY } from "../../shared/constants/index.js";

class AuthService {
  constructor(UserRepository, EmailService, RefreshTokenRepository) {
    this.userRepository = UserRepository;
    this.emailService = EmailService;
    this.refreshTokenRepository = RefreshTokenRepository;
  }

  /**
   * Register a new user
   */
  async register(userData) {
    const { email, username, password } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByIdentifier(email);

    if (existingUser) {
      throw AppError.conflictError(
        "User with this email or username already exists."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();

    // Save token to database
    await this.userRepository.save(user);

    // Send email asynchronously
    this.emailService
      .sendVerificationEmail(user, verificationToken)
      .catch((err) => logger.error("Failed to send verification email:", err));

    return user;
  }

  /**
   * Login user
   */
  async login(userData, createdByIp, userAgent) {
    const { identifier, password, rememberMe } = userData;

    const user = await this.userRepository.findByIdentifier(identifier, true);

    if (!user) {
      throw AppError.notFoundError("User does not exist");
    }

    if (!user.isEmailVerified) {
      throw AppError.unAuthorized(
        "Email not verified. Please verify your email."
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw AppError.unAuthorized("Invalid credentials");
    }

    // Update last login
    await this.userRepository.update(user._id, { lastLogin: new Date() });

    const accessToken = generateAccessToken(user);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    const expiresAt = rememberMe
      ? Date.now() + TOKEN_EXPIRY.REFRESH_TOKEN_REMEMBER
      : Date.now() + TOKEN_EXPIRY.REFRESH_TOKEN_DEFAULT;

    const newRefreshTokenDoc =
      await this.refreshTokenRepository.createRefreshToken({
        userId: user._id,
        token: refreshToken,
        expiresAt,
        createdByIp,
        userAgent,
      });

    return { user, accessToken, refreshToken: newRefreshTokenDoc?.token };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User not found");
    }
    return user;
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(userData) {
    const { email } = userData;
    const user = await this.userRepository.findByIdentifier(email);

    if (!user) {
      throw AppError.notFoundError("User does not exist");
    }

    const resetToken = user.generatePasswordResetToken();

    // Save token to database
    await this.userRepository.save(user);

    // Send email asynchronously
    this.emailService
      .sendPasswordResetEmail(user, resetToken)
      .catch((err) =>
        logger.error("Failed to send password reset email:", err)
      );

    // NOTE: Remove token from response in production
    return resetToken;
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token,
    newPassword,
    createdByIp,
    userAgent,
    rememberMe = false
  ) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.userRepository.findByResetToken(hashedToken, true);

    if (!user) {
      throw AppError.notFoundError("Invalid or expired reset token");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw AppError.badRequestError(
        "New password cannot be the same as the old password"
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    const updatedUser = await this.userRepository.update(user._id, {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
      $unset: {
        passwordResetToken: "",
        passwordResetExpires: "",
      },
    });

    const accessToken = generateAccessToken(updatedUser);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    const expiresAt = rememberMe
      ? Date.now() + TOKEN_EXPIRY.REFRESH_TOKEN_REMEMBER
      : Date.now() + TOKEN_EXPIRY.REFRESH_TOKEN_DEFAULT;

    const newRefreshTokenDoc =
      await this.refreshTokenRepository.createRefreshToken({
        userId: updatedUser._id,
        token: refreshToken,
        expiresAt,
        createdByIp,
        userAgent,
      });

    // Send success email
    this.emailService
      .resetPasswordSuccessful(updatedUser)
      .catch((err) =>
        logger.error("Failed to send password reset success email:", err)
      );

    return {
      user: updatedUser,
      accessToken,
      refreshToken: newRefreshTokenDoc?.token,
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user =
      await this.userRepository.findByEmailVerificationToken(hashedToken);

    if (!user) {
      throw AppError.notFoundError("Invalid or expired verification token");
    }

    if (user.isEmailVerified) {
      throw AppError.badRequestError("Email already verified");
    }

    // Update email verification and clear token
    const updatedUser = await this.userRepository.update(user._id, {
      $set: { isEmailVerified: true },
      $unset: {
        emailVerificationToken: "",
        emailVerificationExpires: "",
      },
    });

    // Send welcome email
    this.emailService
      .sendWelcomeEmail(updatedUser)
      .catch((err) => logger.error("Failed to send welcome email:", err));

    return updatedUser;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw AppError.notFoundError("User does not exist");
    }

    if (user.isEmailVerified) {
      throw AppError.badRequestError("Email already verified");
    }

    const verificationToken = user.generateEmailVerificationToken();

    await this.userRepository.save(user);

    // Send email asynchronously
    this.emailService
      .sendVerificationEmail(user, verificationToken)
      .catch((err) => logger.error("Failed to send verification email:", err));

    return user;
  }

  /**
   * Logout user (revoke current token)
   */
  async logout(currentRefreshToken, createdByIp) {
    await this.refreshTokenRepository.revokeToken(
      currentRefreshToken,
      createdByIp
    );
    return true;
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId, createdByIp) {
    await this.refreshTokenRepository.revokeAllTokenForUser(
      userId,
      createdByIp
    );
    return true;
  }
}

export default new AuthService(
  userRepository,
  emailService,
  refreshTokenRepository
);
