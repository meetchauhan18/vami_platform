import userRepository from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateAccessToken } from "../utils/jwt.utils.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import emailService from "./email.service.js";

class AuthService {
  constructor(UserRepository, EmailService) {
    this.UserRepository = UserRepository;
    this.EmailService = EmailService;
  }

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

  async login(userData) {
    const { identifier, password } = userData;

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

    return { user, accessToken };
  }

  async getProfile(userId) {
    const user = await this.UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User not found");
    }
    return user;
  }

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

  async resetPassword(token, newPassword) {
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

    const accessToken = generateAccessToken({
      userId: updatedUser._id.toString(),
      email: updatedUser.email,
      role: updatedUser.role,
    });

    // send email asynchronously
    this.EmailService.resetPasswordSuccessful(updatedUser).catch((err) =>
      logger.error("Failed to send password reset success email:", err)
    );

    return {
      message: "Password reset successfully",
      user: updatedUser,
      accessToken,
    };
  }

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
}

export default new AuthService(userRepository, emailService);
