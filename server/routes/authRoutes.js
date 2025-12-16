import express from "express";
import { register, login, logout, getMe } from "../controllers/authController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout); // New
router.get("/me", getMe);       // New (Used by React to check login status on refresh)

export default router;