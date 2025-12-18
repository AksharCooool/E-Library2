import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Login User
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // 1. Check if user exists and password matches
  if (user && (await bcrypt.compare(password, user.password))) {
    
    // 👇 2. SECURITY CHECK
    if (user.isBlocked) {
        res.status(403); 
        throw new Error("Access Denied: Your account has been suspended.");
    }

    // 3. Login Successful
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register User
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
    
    const { name, email, password, gender, role, adminSecret } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    //  SECURITY CHECK: 
    let finalRole = "user"; 
    if (role === "admin") {
        if (adminSecret === process.env.ADMIN_SECRET) {
            finalRole = "admin"; 
        } else {
            res.status(401);
            throw new Error("Invalid Admin Secret Key");
        }
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User with the determined role
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        gender: gender || "Not Specified",
        role: finalRole,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role, 
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});