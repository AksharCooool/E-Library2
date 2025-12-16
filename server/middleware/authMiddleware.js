import User from "../models/User.js";

// 1. PROTECT: Verifies the session exists
export const protect = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      // Re-fetch user from DB based on Session ID to ensure they still exist/are valid
      req.user = await User.findById(req.session.userId).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, user not found" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, please login" });
  }
};

// 2. ADMIN: Verifies the user has admin role
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};