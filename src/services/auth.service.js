import userRepository from "../repositories/user.repository.js";
import refreshTokenRepository from "../repositories/refresh-token.repository.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateAccessToken } from "../utils/jwt.utils.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import emailService from "./email.service.js";

class AuthService {
  constructor(UserRepository, EmailService, RefreshTokenRepository) {
    this.UserRepository = UserRepository;
    this.EmailService = EmailService;
    this.RefreshTokenRepository = RefreshTokenRepository;
  }

  // register service
  async register(userData) {
    const { email, username, password } = userData;

    // check if user already exists
    const existingUser = await this.UserRepository.findByIdentifier(email);

    if (existingUser) {
      throw AppError.conflictError(
        "User with this email or username already exists."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // create user - returns the created document
    const user = await this.UserRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    // generate verification token on the created user
    const verificationToken = user.generateEmailVerificationToken();

    // save token to database
    await this.UserRepository.saveEmailVerificationToken(user);

    // send email asynchronously - don't block response
    this.EmailService.sendVerificationEmail(user, verificationToken).catch(
      (err) => logger.error("Failed to send verification email:", err)
    );

    return user;
  }

  // login service
  async login(userData, createdByIp, userAgent) {
    const { identifier, password, rememberMe } = userData;

    const user = await this.UserRepository.findByIdentifier(identifier, true);

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

    await this.UserRepository.updateLastLogin(user._id);

    const accessToken = generateAccessToken(user);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    const newRefreshTokenDoc =
      await this.RefreshTokenRepository.createRefreshToken({
        userId: user._id,
        token: refreshToken,
        expiresAt: Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
        createdByIp,
        userAgent,
      });

    return { user, accessToken, refreshToken: newRefreshTokenDoc?.token };
  }

  // find profile services
  async getProfile(userId) {
    const user = await this.UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User not found");
    }
    return user;
  }

  // forgot password service
  async forgotPassword(userData) {
    const { email } = userData;
    const user = await this.UserRepository.findByIdentifier(email);
    if (!user) {
      throw AppError.notFoundError("User does not exist");
    }

    const resetToken = user.generatePasswordResetToken();

    // save token to database
    await this.UserRepository.savePasswordResetToken(user);

    // send email asynchronously - don't block response
    this.EmailService.sendPasswordResetEmail(user, resetToken).catch((err) =>
      logger.error("Failed to send password reset email:", err)
    );

    // NOTE: Remove token from response in production
    return resetToken;
  }

  // reset password service
  async resetPassword(
    token,
    newPassword,
    createdByIp,
    userAgent,
    rememberMe = false
  ) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.UserRepository.findByResetToken(hashedToken, true);

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

    // updatePassword returns the updated user with { new: true }
    const updatedUser = await this.UserRepository.updatePassword(
      user._id,
      hashedPassword
    );

    const accessToken = generateAccessToken(updatedUser);

    const refreshToken = crypto.randomBytes(64).toString("hex");

    const newRefreshTokenDoc =
      await this.RefreshTokenRepository.createRefreshToken({
        userId: updatedUser._id,
        token: refreshToken,
        expiresAt: Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
        createdByIp,
        userAgent,
      });

    // send email asynchronously
    this.EmailService.resetPasswordSuccessful(updatedUser).catch((err) =>
      logger.error("Failed to send password reset success email:", err)
    );

    return {
      user: updatedUser,
      accessToken,
      refreshToken: newRefreshTokenDoc?.token,
    };
  }

  // verify email service
  async verifyEmail(token) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user =
      await this.UserRepository.findByEmailVerificationToken(hashedToken);

    if (!user) {
      throw AppError.notFoundError("Invalid or expired verification token");
    }

    if (user.isEmailVerified) {
      throw AppError.badRequestError("Email already verified");
    }

    // updateEmailVerification returns the updated user with { new: true }
    const updatedUser = await this.UserRepository.updateEmailVerification(
      user._id
    );

    // send email asynchronously
    this.EmailService.sendWelcomeEmail(updatedUser).catch((err) =>
      logger.error("Failed to send welcome email:", err)
    );

    return updatedUser;
  }

  // resend verification email service
  async resendVerificationEmail(userId) {
    const user = await this.UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User does not exist");
    }

    if (user.isEmailVerified) {
      throw AppError.badRequestError("Email already verified");
    }

    const verificationToken = user.generateEmailVerificationToken();

    await this.UserRepository.saveEmailVerificationToken(user);

    // send email asynchronously
    this.EmailService.sendVerificationEmail(user, verificationToken).catch(
      (err) => logger.error("Failed to send verification email:", err)
    );

    return user;
  }

  // logout service
  async logout(currentRefreshToken, createdByIp) {
    await this.RefreshTokenRepository.revokeToken(
      currentRefreshToken,
      createdByIp
    );
    return true;
  }

  // logout all service
  async logoutAll(userId, createdByIp) {
    console.log("🚀 ~ AuthService ~ logoutAll ~ userId:", userId)
    await this.RefreshTokenRepository.revokeAllTokenForUser(
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
