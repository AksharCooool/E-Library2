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
    
    // 👇 ADDED THIS FIELD (Fixes the Profile Update bug)
    gender: { type: String, default: "Not Specified" },

    // Favorites
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    
    // --- TRACK READING PROGRESS ---
    readingProgress: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        currentPage: { type: Number, default: 0 },
        totalPages: { type: Number, default: 0 }, 
        lastRead: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);