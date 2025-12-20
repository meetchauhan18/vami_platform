import { asyncHandler } from "../middlewares/asyncHandler.js";
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

  forgotPassword = asyncHandler(async (req, res) => {
    const resetToken = await this.AuthService.forgotPassword(req.body);
    res.status(200).json({
      success: true,
      message: "Password reset token sent successfully",
      token: resetToken,
    });
  });

  resetPassword = asyncHandler(async (req, res) => {
    const user = await this.AuthService.resetPassword(
      req.body.token,
      req.body.password
    );

    // return success response
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: user,
    });
  });

  verifyEmail = asyncHandler(async (req, res) => {
    const user = await this.AuthService.verifyEmail(req.body.token);
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: user,
    });
  });

  resendVerificationEmail = asyncHandler(async (req, res) => {
    const user = await this.AuthService.resendVerificationEmail(req.user?._id);
    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
      data: user,
    });
  });
}

export default new AuthController(authService);
