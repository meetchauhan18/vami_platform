// local imports
import authService from "../services/auth.service.js";
import refreshTokenService from "../services/refreshToken.service.js";
import emailService from "../services/email.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import systemService from "../services/system.service.js";

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
