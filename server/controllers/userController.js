import User from "../models/User.js";
import bcrypt from "bcryptjs"; // <--- Required for password hashing

// @desc    Toggle Favorite (Add/Remove)
// @route   PUT /api/users/favorites/:id
export const toggleFavorite = async (req, res) => {
  const bookId = req.params.id; 
  const user = await User.findById(req.session.userId); // Use Session ID

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
// --- NEW FUNCTION ADDED HERE ---
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (user) {
      // Update fields if they exist in the request body
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.gender = req.body.gender || user.gender;

      // Handle Password Update (Only hash if a new password is sent)
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

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
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};