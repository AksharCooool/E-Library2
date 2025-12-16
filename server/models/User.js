import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ["user", "admin"], 
        default: "user" 
    },
    // Favorites
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    
    // --- NEW: TRACK READING PROGRESS ---
    readingProgress: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        currentPage: { type: Number, default: 1 },
        totalPages: { type: Number, default: 100 }, 
        lastRead: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);