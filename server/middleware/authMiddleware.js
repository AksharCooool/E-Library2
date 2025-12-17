import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js"; 

// 1. PROTECT: Verifies the JWT Token AND checks if user is blocked
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if headers contain "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get the token (remove "Bearer " from the string)
      token = req.headers.authorization.split(" ")[1];

      // Decode the token using your Secret Key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user and attach it to the request (exclude password)
      const user = await User.findById(decoded.id).select("-password");


      // 👇 NEW SECURITY CHECK: Stop here if user is blocked
      if (user && user.isBlocked) {
        res.status(403); // 403 = Forbidden
        throw new Error("Access Denied: Your account has been suspended.");
      }

      req.user = user;
      next();

    } catch (error) {
      console.error(error);

      // 👇 Handle specific "Suspended" error differently than generic token errors
      if (error.message.includes("suspended")) {
        res.status(403);
        throw new Error(error.message); // Pass the specific message to frontend
      } else {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// 2. ADMIN: Verifies the user has admin role
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};