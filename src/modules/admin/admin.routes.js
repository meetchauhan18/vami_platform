// libs imports
import express from "express";

// local imports
import authenticate from "../../shared/middlewares/auth.middleware.js";
import { authorize } from "../../shared/middlewares/authorize.middleware.js";
import adminController from "./admin.controller.js";

const router = express.Router();
const { getUsers, getSystemStats } = adminController;

router.get("/users", authenticate, authorize("admin"), getUsers);
router.get("/stats", authenticate, authorize("admin"), getSystemStats);

export default router;
