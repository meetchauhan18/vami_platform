import express from "express";
import authController from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = express.Router();

const { register, login, getProfile } = authController;

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/profile", authenticate, getProfile);

export default router;
