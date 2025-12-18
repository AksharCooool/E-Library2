import User from "../models/User.js";
import Book from "../models/Book.js";
import Review from "../models/Review.js";
import asyncHandler from "express-async-handler";

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
  // 1. Fetch Counts
  const totalBooks = await Book.countDocuments();
  const totalReviews = await Review.countDocuments();
  
  // Count users 
  const activeReaders = await User.countDocuments({ readingProgress: { $not: { $size: 0 } } });

  // Calculate Total Reads 
  const readsResult = await Book.aggregate([
    { $group: { _id: null, total: { $sum: "$reads" } } }
  ]);
  const totalReads = readsResult[0]?.total || 0;

  // 2. Fetch Recent Activity 
  const newUsers = await User.find()
    .select("name createdAt")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const recentReviews = await Review.find()
    .populate("user", "name")
    .populate("book", "title")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  // 3. Merge and Format Activity Data
  const activityMap = [
    ...newUsers.map(u => ({
        id: u._id,
        user: u.name,
        content: "Member",
        action: "Joined Library",
        date: u.createdAt,
        type: "user"
    })),
    ...recentReviews.map(r => ({
        id: r._id,
        user: r.user?.name || "Anonymous",
        content: r.book?.title || "Deleted Book",
        action: `Rated ${r.rating} Stars`,
        date: r.createdAt,
        type: "review"
    }))
  ];

  // Sort combined list by date 
  const sortedActivity = activityMap.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  res.json({
    counts: {
        totalBooks,
        activeReaders,
        totalReads,
        totalReviews
    },
    recentActivity: sortedActivity
  });
});

// @desc    Get All Users with Stats
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  // Fetch all users 
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });

  // Calculate stats for each user 
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const reviewsCount = await Review.countDocuments({ user: user._id });
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked, // Uses the new field we added to User model
        createdAt: user.createdAt,
        stats: {
            booksRead: user.readingProgress.length,
            favorites: user.favorites.length,
            reviews: reviewsCount
        }
      };
    })
  );

  res.json(usersWithStats);
});

// @desc    Block/Unblock User
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Prevent blocking Admin 
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error("You cannot block yourself.");
        }

        user.isBlocked = !user.isBlocked; 
        await user.save();
        
        res.json({ 
            message: user.isBlocked ? "User Blocked" : "User Activated", 
            isBlocked: user.isBlocked 
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Prevent deleting Admin
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error("You cannot delete your own admin account.");
        }

        await User.deleteOne({ _id: user._id });
        
        
        await Review.deleteMany({ user: user._id });

        res.json({ message: "User removed" });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});