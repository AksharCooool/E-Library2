import User from "../models/User.js";
import bcrypt from "bcryptjs";

// @desc    Toggle Favorite (Add/Remove)
// @route   PUT /api/users/favorites/:id
export const toggleFavorite = async (req, res) => {
  const bookId = req.params.id;
  // Safety check for session
  if (!req.session || !req.session.userId) {
     return res.status(401).json({ message: "Not authorized" });
  }
  
  const user = await User.findById(req.session.userId);

  if (user.favorites.includes(bookId)) {
    // Remove if already exists
    user.favorites = user.favorites.filter((id) => id.toString() !== bookId);
    await user.save();
    res.json({ message: "Removed from favorites", favorites: user.favorites });
  } else {
    // Add if not exists
    user.favorites.push(bookId);
    await user.save();
    res.json({ message: "Added to favorites", favorites: user.favorites });
  }
};

// @desc    Get User Favorites (Populated with Book details)
// @route   GET /api/users/favorites
export const getFavorites = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authorized" });
    }
    // .populate('favorites') replaces the IDs with the actual Book data
    const user = await User.findById(req.session.userId).populate("favorites");
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching favorites" });
  }
};

// @desc    Update Reading Progress
// @route   PUT /api/users/progress
export const updateProgress = async (req, res) => {
  const { bookId, currentPage, totalPages } = req.body;
  
  if (!req.session || !req.session.userId) {
     return res.status(401).json({ message: "Not authorized" });
  }
  const userId = req.session.userId;

  try {
    const user = await User.findById(userId);

    // Check if we are already tracking this book
    const progressIndex = user.readingProgress.findIndex(p => p.bookId.toString() === bookId);

    if (progressIndex > -1) {
      // Update existing entry
      user.readingProgress[progressIndex].currentPage = currentPage;
      user.readingProgress[progressIndex].totalPages = totalPages;
      user.readingProgress[progressIndex].lastRead = Date.now();
    } else {
      // Add new entry
      user.readingProgress.push({ bookId, currentPage, totalPages });
    }

    await user.save();
    res.status(200).json({ message: "Progress saved" });
  } catch (error) {
    console.error("Progress Error:", error);
    res.status(500).json({ message: "Error saving progress" });
  }
};

// @desc    Update User Profile (Name, Email, Gender, Password)
// @route   PUT /api/users/profile
// --- THIS IS THE FIXED VERSION ---
export const updateUserProfile = async (req, res) => {
  try {
    // 1. SAFETY CHECK: Ensure the user is actually logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    const user = await User.findById(req.session.userId);

    if (user) {
      // 2. DUPLICATE EMAIL CHECK
      // If the user is changing their email, check if the new email is already taken
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: "That email is already in use by another account." });
        }
        user.email = req.body.email;
      }

      // 3. Update other fields
      user.name = req.body.name || user.name;
      user.gender = req.body.gender || user.gender;

      // 4. Update Password (Only if a new one is provided)
      if (req.body.password && req.body.password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      // 5. Send back the new data
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        gender: updatedUser.gender,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    // 6. CRITICAL: Log the actual error to your VS Code terminal
    console.error("❌ PROFILE UPDATE ERROR:", error);

    // Handle specific MongoDB Duplicate Key Error
    if (error.code === 11000) {
        return res.status(400).json({ message: "This email is already registered." });
    }

    res.status(500).json({ message: "Server error: " + error.message });
  }
};