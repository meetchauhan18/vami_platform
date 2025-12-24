// local imports
import authService from "../auth/auth.service.js";
import refreshTokenService from "../auth/refreshToken.service.js";
import emailService from "../../shared/services/email.service.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.js";
import systemService from "./system.service.js";

class AdminController {
  constructor(AuthService, SystemService, RefreshTokenService, EmailService) {
    this.AuthService = AuthService;
    this.SystemService = SystemService;
    this.RefreshTokenService = RefreshTokenService;
    this.EmailService = EmailService;
  }

  getUsers = asyncHandler(async (req, res) => {
    const users = await this.SystemService.getUsers();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  });

  getSystemStats = asyncHandler(async (req, res) => {
    const stats = await this.SystemService.getSystemStats();
    res.status(200).json({
      success: true,
      message: "System stats fetched successfully",
      data: stats,
    });
  });
}

export default new AdminController(
  authService,
  systemService,
  refreshTokenService,
  emailService
);
