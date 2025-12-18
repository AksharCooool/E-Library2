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
    //  Block status field
    isBlocked: {
      type: Boolean,
      default: false,
    },
    readingProgress: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        currentPage: { type: Number, default: 0 },
        totalPages: { type: Number, default: 0 }, 
        lastRead: { type: Date, default: Date.now } 
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