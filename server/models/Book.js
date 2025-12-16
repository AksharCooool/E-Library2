import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String }, 
    coverImage: { type: String },  
    pdfUrl: { type: String },       

    // Dynamic Page Count
    pages: { type: Number, required: true, default: 0 }, 

    // 👇 REMOVED: reviews array (Now stored in a separate collection)
    
    // Summary Stats (We still keep these for quick display)
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    isTrending: { type: Boolean, default: false },
    
    // Optional: Reference to user who added the book (if needed)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema);
export default Book;