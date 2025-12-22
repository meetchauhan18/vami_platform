// libs imports
import express from "express";

// local imports
import authenticate from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();
const { getUsers, getSystemStats } = adminController;

router.get("/users", authenticate, authorize("admin"), getUsers);
router.get("/stats", authenticate, authorize("admin"), getSystemStats);

export default router;
