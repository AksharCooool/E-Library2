import User from "../models/User.js";
import Review from "../models/Review.js"; 
import Book from "../models/Book.js"; // ✅ ADDED: Import Book model to update read counts
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

// @desc    Get Current User Profile & Stats
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("favorites")
    .populate("readingProgress.bookId");

  if (user) {
    const reviewsCount = await Review.countDocuments({ user: req.user._id });

    // Filter Duplicates in Progress
    const uniqueProgressMap = new Map();
    if (user.readingProgress) {
        user.readingProgress.forEach((item) => {
            if (item.bookId) {
                const bId = item.bookId._id ? item.bookId._id.toString() : item.bookId.toString();
                uniqueProgressMap.set(bId, item);
            }
        });
    }
    const uniqueProgressList = Array.from(uniqueProgressMap.values());

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      createdAt: user.createdAt, 
      
      favoritesCount: user.favorites.length,
      booksStarted: uniqueProgressList.length,
      reviewsCount: reviewsCount,

      favorites: user.favorites, 
      readingProgress: uniqueProgressList 
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update Reading Progress & Increment Global Read Count
// @route   PUT /api/users/progress
// @access  Private
export const updateProgress = asyncHandler(async (req, res) => {
  const { bookId, currentPage, totalPages } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    // ✅ 1. Check if the user is starting this book for the first time
    const alreadyStarted = user.readingProgress.some(
        (p) => p.bookId.toString() === bookId
    );

    // ✅ 2. If it's a new start, increment the global 'reads' field in the Book document
    if (!alreadyStarted) {
        await Book.findByIdAndUpdate(bookId, { $inc: { reads: 1 } });
    }

    // 3. Cleanup duplicates (remove old entries for this specific book)
    user.readingProgress = user.readingProgress.filter(
      (p) => p.bookId.toString() !== bookId
    );

    // 4. Add the new/updated progress
    user.readingProgress.push({ 
        bookId, 
        currentPage, 
        totalPages,
        lastRead: Date.now()
    });

    await user.save();
    res.status(200).json({ message: "Progress saved" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Toggle Favorite (Add/Remove)
// @route   PUT /api/users/favorites/:id
export const toggleFavorite = asyncHandler(async (req, res) => {
  const bookId = req.params.id;
  const user = await User.findById(req.user._id);

  if (user) {
    if (user.favorites.includes(bookId)) {
      user.favorites = user.favorites.filter((id) => id.toString() !== bookId);
      await user.save();
      res.json({ message: "Removed from favorites", favorites: user.favorites });
    } else {
      user.favorites.push(bookId);
      await user.save();
      res.json({ message: "Added to favorites", favorites: user.favorites });
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get User Favorites
// @route   GET /api/users/favorites
export const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  if (user) {
    res.json(user.favorites);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update User Profile
// @route   PUT /api/users/profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error("Email already in use");
      }
      user.email = req.body.email;
    }

    user.name = req.body.name || user.name;
    user.gender = req.body.gender || user.gender;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    
    const reviewsCount = await Review.countDocuments({ user: updatedUser._id });

    const uniqueProgressMap = new Map();
    if (updatedUser.readingProgress) {
        updatedUser.readingProgress.forEach(item => {
             if(item.bookId) uniqueProgressMap.set(item.bookId.toString(), item);
        });
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      gender: updatedUser.gender,
      createdAt: updatedUser.createdAt, 
      favoritesCount: updatedUser.favorites.length,
      booksStarted: uniqueProgressMap.size,
      reviewsCount: reviewsCount,
      token: req.headers.authorization.split(" ")[1] 
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});