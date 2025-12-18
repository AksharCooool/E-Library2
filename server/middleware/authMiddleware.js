import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js"; 

// 1. PROTECT: 
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if headers contain "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");


      //  NEW SECURITY CHECK: 
      if (user && user.isBlocked) {
        res.status(403); 
        throw new Error("Access Denied: Your account has been suspended.");
      }

      req.user = user;
      next();

    } catch (error) {
      console.error(error);

      if (error.message.includes("suspended")) {
        res.status(403);
        throw new Error(error.message); 
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