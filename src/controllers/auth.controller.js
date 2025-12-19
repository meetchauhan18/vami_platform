import { asyncHandler } from "../middlewares/asyncHandler.js";
import userRepository from "../repositories/user.repository.js";
import authService from "../services/auth.service.js";

class AuthController {
  constructor(AuthService) {
    this.AuthService = AuthService;
  }

  register = asyncHandler(async (req, res) => {
    const user = await this.AuthService.register(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  });

  login = asyncHandler(async (req, res) => {
    const user = await this.AuthService.login(req.body);
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: user,
    });
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await this.AuthService.getProfile(req.user?._id);
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  });
}

export default new AuthController(authService);
