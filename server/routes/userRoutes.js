import express from "express";
import { 
  toggleFavorite, 
  getFavorites, 
  updateProgress, 
  updateUserProfile // <--- Import the new controller
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all favorites (Protected)
router.get("/favorites", protect, getFavorites);

// Toggle a favorite (Protected)
router.put("/favorites/:id", protect, toggleFavorite);

// Update Reading Progress (Protected)
router.put("/progress", protect, updateProgress);

// Update User Profile (Name, Email, Password, Gender) - NEW
router.put("/profile", protect, updateUserProfile);

export default router;