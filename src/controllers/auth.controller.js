import userRepository from "../repositories/user.repository.js";
import authService from "../services/auth.service.js";

class AuthController {
  constructor(AuthService) {
    this.AuthService = AuthService;
  }

  register = async (req, res) => {
    try {
      const user = await this.AuthService.register(req.body);
      console.log("🚀 ~ AuthController ~ user:", user);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  login = async (req, res) => {
    try {
      const user = await this.AuthService.login(req.body);
      console.log("🚀 ~ AuthController ~ user:", user);
      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  getProfile = async (req, res) => {
    try {
      const user = await this.AuthService.getProfile(req.user?._id);
      console.log("🚀 ~ AuthController ~ user:", user);
      res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
}

export default new AuthController(authService);
