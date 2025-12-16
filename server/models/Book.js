import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String }, 
    coverImage: { type: String },  
    pdfUrl: { type: String },      
    rating: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema);
export default Book;