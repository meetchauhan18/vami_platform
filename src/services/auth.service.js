import userRepository from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../utils/jwt.utils.js";

class AuthService {
  constructor(UserRepository) {
    this.UserRepository = UserRepository;
  }

  async register(userData) {
    console.log("🚀 ~ AuthService ~ registerUser ~ userData:", userData);
    try {
      // get email from userData
      const { email, username, password } = userData;

      // check if user already exists
      const existingUser = await this.UserRepository.findByIdentifier(email);

      // throw an error if user already exists
      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // create user
      const user = await this.UserRepository.create({
        username,
        email,
        password: hashedPassword,
      });
      console.log("🚀 ~ AuthService ~ registerUser ~ user:", user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(userData) {
    console.log("🚀 ~ AuthService ~ login ~ userData:", userData);
    try {
      const { identifier, password } = userData;

      // find user by email or username
      const user = await this.UserRepository.findByIdentifier(identifier, true);
      console.log("🚀 ~ AuthService ~ login ~ user:", user);

      if (!user) {
        throw new Error("User does not exist");
      }

      // check whether password is valid or not
      const isPasswordValid = await bcrypt.compare(password, user?.password);
      console.log(
        "🚀 ~ AuthService ~ login ~ isPasswordValid:",
        isPasswordValid
      );

      // if not throw error
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      await this.UserRepository.updateLastLogin(user?._id);

      // generate access and refresh token
      const accessToken = generateAccessToken(user);
      console.log("🚀 ~ AuthService ~ login ~ accessToken:", accessToken);

      // return user
      console.log("🚀 ~ AuthService ~ login ~ user:", user);
      return { user, accessToken };
    } catch (error) {
      throw error;
    }
  }

  async getProfile(userId) {
    const user = await this.UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

export default new AuthService(userRepository);
