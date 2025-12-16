import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js"; 

// 1. PROTECT: Verifies the JWT Token sent from React
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
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
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