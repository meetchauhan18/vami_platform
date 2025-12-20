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
    // get email from userData
    const { email, username, password } = userData;

    // check if user already exists
    const existingUser = await this.UserRepository.findByIdentifier(email);

    // throw an error if user already exists
    if (existingUser) {
      throw AppError.conflictError(
        "User with this email or username already exists."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 13);

    // create user
    const user = await this.UserRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    const newUser = await this.UserRepository.findById(user?._id);

    const verificationToken = newUser.generateEmailVerificationToken();
    console.log(
      "🚀 ~ AuthService ~ register ~ verificationToken:",
      verificationToken
    );

    // save user to persist token and expiration to database via repository
    await this.UserRepository.saveEmailVerificationToken(newUser);

    await this.EmailService.sendVerificationEmail(newUser, verificationToken);

    return user;
  }

  async login(userData) {
    const { identifier, password } = userData;

    // find user by email or username
    const user = await this.UserRepository.findByIdentifier(identifier, true);

    if (!user) {
      throw AppError.notFoundError("Token is invalid or expired");
    }

    // check whether password is valid or not
    const isPasswordValid = await bcrypt.compare(password, user?.password);

    // if not throw error
    if (!isPasswordValid) {
      throw AppError.unAuthorized("Invalid credentials");
    }

    await this.UserRepository.updateLastLogin(user?._id);

    // generate access and refresh token
    const accessToken = generateAccessToken(user);

    // return user
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
    logger.info("Password Reset Token:", resetToken);
    logger.info(
      "Reset URL:",
      `http://localhost:3000/reset-password?token=${resetToken}`
    );

    // save user to persist token and expiration to database via repository
    await this.UserRepository.savePasswordResetToken(user);

    const updatedUser = await this.UserRepository.findById(user?._id);

    await this.EmailService.sendPasswordResetEmail(updatedUser, resetToken);

    return resetToken;
  }

  async resetPassword(token, newPassword) {
    // hash the incoming token to compare with stored hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // find user by reset token
    const user = await this.UserRepository.findByResetToken(hashedToken, true);

    // throw error if user not found
    if (!user) {
      throw AppError.notFoundError("User does not exist");
    }

    // check if new password is same as old password
    const isPasswordValid = await bcrypt.compare(newPassword, user?.password);

    // throw error if new password is same as old password
    if (isPasswordValid) {
      throw AppError.unAuthorized("Password is same as old password");
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 13);

    // update password
    await this.UserRepository.updatePassword(user?._id, hashedPassword);

    // find updated user
    const updatedUser = await this.UserRepository.findById(user?._id);

    // generate access token
    const accessToken = generateAccessToken({
      userId: updatedUser._id.toString(),
      email: updatedUser.email,
      role: updatedUser.role,
    });

    await this.EmailService.resetPasswordSuccessful(updatedUser);

    return {
      message: "Password reset successfully",
      user,
      accessToken,
    };
  }

  async verifyEmail(token) {
    console.log("🚀 ~ AuthService ~ verifyEmail ~ token:", token);
    // hash the incoming token to compare with stored hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log("🚀 ~ AuthService ~ verifyEmail ~ hashedToken:", hashedToken);

    // find user by reset token
    const user = await this.UserRepository.findByEmailVerificationToken(
      hashedToken,
      true
    );
    console.log("🚀 ~ AuthService ~ verifyEmail ~ user:", user);

    // throw error if user not found
    if (!user) {
      throw AppError.notFoundError("User does not exist");
    }

    // throw error if email already verified
    if (user?.isEmailVerified) {
      throw AppError.badRequestError("Email already verified");
    }

    // update email verification
    await this.UserRepository.updateEmailVerification(user?._id);

    // find updated user
    const updatedUser = await this.UserRepository.findById(user?._id);

    await this.EmailService.sendWelcomeEmail(updatedUser);

    return updatedUser;
  }

  async resendVerificationEmail(userId) {
    const user = await this.UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFoundError("User does not exist");
    }
    const verificationToken = user.generateEmailVerificationToken();

    // save user to persist token and expiration to database via repository
    await this.UserRepository.saveEmailVerificationToken(user);

    const updatedUser = await this.UserRepository.findById(user?._id);

    await this.EmailService.sendVerificationEmail(
      updatedUser,
      verificationToken
    );

    return updatedUser;
  }
}

export default new AuthService(userRepository, emailService);
