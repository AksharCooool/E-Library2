import Book from "../models/Book.js";
import Review from "../models/Review.js";
import fs from "fs";
import path from "path";
import asyncHandler from "express-async-handler";

// 1. GET ALL BOOKS
export const getBooks = asyncHandler(async (req, res) => {
  // Sort by newest first (-1)
  const books = await Book.find({}).sort({ createdAt: -1 });
  res.json(books);
});

// 2. GET SINGLE BOOK
export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    // Fetch reviews separately for this book
    const reviews = await Review.find({ book: req.params.id }).sort({ createdAt: -1 });

    // Combine book data with reviews
    res.json({ ...book.toObject(), reviews }); 
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// 3. CREATE BOOK
export const createBook = asyncHandler(async (req, res) => {
  const { title, author, category, description, coverImage, pdfUrl, pages } = req.body;

  let finalPdfUrl = pdfUrl; // Default: use the manually entered link

  // IF A FILE WAS UPLOADED
  if (req.file) {
    finalPdfUrl = `${req.protocol}://${req.get("host")}/uploads/pdfs/${req.file.filename}`;
  }

  const book = new Book({
    user: req.user._id,
    title,
    author,
    category,
    description,
    coverImage,
    pdfUrl: finalPdfUrl,
    pages: pages || 0,
    isTrending: false, // Default to false
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

// 4. DELETE BOOK
export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    // Delete local PDF file if it exists
    if (book.pdfUrl && book.pdfUrl.includes("/uploads/pdfs/")) {
      const filename = book.pdfUrl.split("/").pop();
      const filePath = path.join(process.cwd(), "uploads/pdfs", filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); 
      }
    }

    await book.deleteOne();
    // Delete associated reviews
    await Review.deleteMany({ book: req.params.id });
    
    res.json({ message: 'Book removed' });
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// 5. CREATE BOOK REVIEW
export const createBookReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const book = await Book.findById(req.params.id);

  if (book) {
    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      book: req.params.id,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("You have already reviewed this book");
    }

    // Create Review
    await Review.create({
      book: req.params.id,
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    // Recalculate Average Rating
    const stats = await Review.aggregate([
      { $match: { book: book._id } },
      {
        $group: {
          _id: "$book",
          numReviews: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    book.numReviews = stats[0] ? stats[0].numReviews : 1;
    book.rating = stats[0] ? stats[0].avgRating : Number(rating);

    await book.save();
    
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// 6. TOGGLE TRENDING STATUS (NEW)
// @desc    Switch isTrending between true/false
// @route   PUT /api/books/:id/trending
export const toggleTrending = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    book.isTrending = !book.isTrending; // Flip the boolean
    const updatedBook = await book.save();
    res.json(updatedBook);
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});