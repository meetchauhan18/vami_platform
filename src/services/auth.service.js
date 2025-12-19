import userRepository from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../utils/jwt.utils.js";
import AppError from "../utils/AppError.js";

class AuthService {
  constructor(UserRepository) {
    this.UserRepository = UserRepository;
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

    return user;
  }

  async login(userData) {
    const { identifier, password } = userData;

    // find user by email or username
    const user = await this.UserRepository.findByIdentifier(identifier, true);

    if (!user) {
      throw AppError.notFoundError("User does not exist");
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
    console.log("Password Reset Token:", resetToken);
    console.log(
      "Reset URL:",
      `http://localhost:3000/reset-password?token=${resetToken}`
    );
    await user.save({ validateBeforeSave: false });
    return resetToken;
  }

  async resetPassword(token, newPassword) {
    // validate token and password
    if(!token || !newPassword){
      throw AppError.badRequestError("Token and password are required");
    }

    // find user by reset token
    const user = await this.UserRepository.findByResetToken(token, true);

    // throw error if user not found
    if (!user) {
      throw AppError.notFoundError("User does not exist");
    }

    // check if new password is same as old password
    const isPasswordValid = await bcrypt.compare(newPassword, user?.password);

    // throw error if new password is same as old password
    if(isPasswordValid){
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

    return {
      message: "Password reset successfully",
      user,
      accessToken,
    };
  }
}

export default new AuthService(userRepository);
