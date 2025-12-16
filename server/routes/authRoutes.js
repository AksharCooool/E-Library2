import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
// 👇 Import these two so we can handle the "/me" route
import { getUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// 👇 THIS IS THE FIX: Restore the endpoint your frontend is looking for
router.get("/me", protect, getUserProfile);

export default router;