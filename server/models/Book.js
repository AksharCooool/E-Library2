import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String }, 
    coverImage: { type: String },  
    pdfUrl: { type: String },       

    //  Dynamic Page Count 
    pages: { type: Number, required: true, default: 0 }, 

    //  Global read counter for "Most Read" & Admin Stats
    reads: { type: Number, default: 0 }, 

    //  Summary Stats 
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    isTrending: { type: Boolean, default: false },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
}, {
    timestamps: true
});


bookSchema.index({ title: 'text', author: 'text', category: 'text' });

const Book = mongoose.model('Book', bookSchema);
export default Book;