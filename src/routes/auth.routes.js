import express from "express";
import authController from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../validators/auth.validators.js";
import authenticate from "../middlewares/auth.middleware.js";
import { authLimiter, registerLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

const { register, login, getProfile, forgotPassword, resetPassword } = authController;

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/profile", authenticate, getProfile);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
