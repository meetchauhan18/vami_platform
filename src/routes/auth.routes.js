import express from "express";
import authController from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validators.js";
import authenticate from "../middlewares/auth.middleware.js";
import { authLimiter, registerLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

const {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
  logout,
  logoutAll
} = authController;

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/profile", authenticate, getProfile);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  resetPassword
);
router.post(
  "/verify-email",
  authLimiter,
  validate(verifyEmailSchema),
  verifyEmail
);
router.post(
  "/resend-verification",
  authLimiter,
  authenticate,
  resendVerificationEmail
);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, logout);
router.post("/logout-all", authenticate, logoutAll);

export default router;
