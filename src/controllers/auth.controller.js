import { asyncHandler } from "../middlewares/asyncHandler.js";
import authService from "../services/auth.service.js";
import refreshTokenService from "../services/refreshToken.service.js";
class AuthController {
  constructor(AuthService, RefreshTokenService) {
    this.AuthService = AuthService;
    this.RefreshTokenService = RefreshTokenService;
    this.cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };
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
    const { user, accessToken, refreshToken } = await this.AuthService.login(
      req.body,
      req.ip,
      req.headers["user-agent"]
    );

    // store access token in cookie
    res.cookie("accessToken", accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // store refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      ...this.cookieOptions,
      maxAge: (req.body.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: { user, accessToken, refreshToken },
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
    const { user, accessToken, refreshToken } =
      await this.AuthService.resetPassword(
        req.body.token,
        req.body.password,
        req.ip,
        req.headers["user-agent"],
        req.body.rememberMe
      );

    // store access token in cookie after resetting the password
    res.cookie("accessToken", accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // store refresh token in cookie after resetting the password
    res.cookie("refreshToken", refreshToken, {
      ...this.cookieOptions,
      maxAge: (req.body.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    // return success response
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: { user, accessToken, refreshToken },
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

  refreshToken = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } =
      await this.RefreshTokenService.refreshToken(
        req.cookies.refreshToken,
        req.ip,
        req.headers["user-agent"]
      );

    // store access token in cookie
    res.cookie("accessToken", accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // store refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    res.status(200).json({
      success: true,
      message: "Refresh token generated successfully",
      data: { accessToken, refreshToken },
    });
  });

  logout = asyncHandler(async (req, res) => {
    await this.AuthService.logout(req.cookies.refreshToken, req.ip);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  });

  logoutAll = asyncHandler(async (req, res) => {
    await this.AuthService.logoutAll(req.user?._id, req.ip);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    res.status(200).json({
      success: true,
      message: "User logged out from all devices successfully",
    });
  });
}

export default new AuthController(authService, refreshTokenService);
