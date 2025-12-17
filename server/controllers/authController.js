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
    
    // 👇 2. SECURITY CHECK: Is the user blocked?
    if (user.isBlocked) {
        res.status(403); // 403 = Forbidden
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
    // 👇 Extract role and adminSecret from request
    const { name, email, password, gender, role, adminSecret } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    // 👇 SECURITY CHECK: Verify Admin Secret
    let finalRole = "user"; // Default to user
    if (role === "admin") {
        if (adminSecret === process.env.ADMIN_SECRET) {
            finalRole = "admin"; // Grant admin only if key matches
        } else {
            res.status(401);
            throw new Error("Invalid Admin Secret Key");
        }
    }

    // Hash Password
    // NOTE: Ensure your User.js model does NOT have a pre('save') hook that hashes password,
    // or you will hash it twice!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User with the determined role
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        gender: gender || "Not Specified",
        role: finalRole,
        // isBlocked defaults to false in Schema, so we don't need to set it here
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role, // This will now be 'admin' if successful
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});