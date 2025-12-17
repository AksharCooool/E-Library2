import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      default: "Not Specified",
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    // 👇 ADD THIS FIELD TO MAKE BLOCKING WORK
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // (Optional) Reading Progress for your dashboard stats
    readingProgress: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        currentPage: { type: Number, default: 0 },
      },
    ],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;