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
}

export default new AuthService(userRepository);
