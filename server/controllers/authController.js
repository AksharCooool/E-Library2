import User from "../models/User.js";
import bcrypt from "bcryptjs";

// @desc    Register new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, role, adminSecret, gender } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    let finalRole = "user";
    if (role === "admin") {
      if (adminSecret === process.env.ADMIN_SECRET) {
        finalRole = "admin";
      } else {
        return res.status(401).json({ message: "Invalid Admin Secret Key!" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      gender: gender || "male",
      role: finalRole, 
    });

    if (user) {
      req.session.userId = user._id; // Auto login
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    
    // Session Login
    req.session.userId = user._id;

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      favorites: user.favorites,
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Could not log out" });
    res.clearCookie("connect.sid"); 
    res.json({ message: "Logged out successfully" });
  });
};

// @desc    Check if user is logged in
// @route   GET /api/auth/me
// --- UPDATED FUNCTION ---
export const getMe = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  // We populate 'favorites' AND 'readingProgress.bookId' 
  // so the dashboard gets the full book details for the continue reading list
  const user = await User.findById(req.session.userId)
    .select("-password")
    .populate("favorites")
    .populate("readingProgress.bookId"); 

  res.json(user);
};