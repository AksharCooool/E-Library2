import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Book", // Links the review to a specific book
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Links the review to a user
    },
    name: { type: String, required: true }, // Storing name here saves a lookup later
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Prevent user from reviewing the same book twice (Optional but recommended)
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;