import express from "express";
import { 
  toggleFavorite, 
  getFavorites, 
  updateProgress,
  getUserProfile,   
  updateUserProfile 
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all favorites (Protected)
router.get("/favorites", protect, getFavorites);

// Toggle a favorite (Protected)
router.put("/favorites/:id", protect, toggleFavorite);

// Update Reading Progress (Protected)
router.put("/progress", protect, updateProgress);

// --- User Profile Routes ---

// Get User Profile (Protected)
// Use this to pre-fill the profile form on the frontend
router.get("/profile", protect, getUserProfile);

// Update User Profile (Name, Email, Password, Gender)
router.put("/profile", protect, updateUserProfile);

export default router;