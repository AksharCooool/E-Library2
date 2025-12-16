import Book from "../models/Book.js";
import Review from "../models/Review.js"; // <--- Import the new Review model
import fs from "fs";
import path from "path";
import asyncHandler from "express-async-handler"; // Recommended wrapper for cleaner error handling

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
    // 👇 FETCH REVIEWS SEPARATELY
    // This keeps the main book load fast. We find reviews that belong to this book ID.
    const reviews = await Review.find({ book: req.params.id }).sort({ createdAt: -1 });

    // We combine them into one object so the frontend gets everything it expects
    // .toObject() converts the Mongoose document to a plain JavaScript object
    res.json({ ...book.toObject(), reviews }); 
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// 3. CREATE BOOK (Handles File Upload OR Link)
export const createBook = asyncHandler(async (req, res) => {
  // 👇 ADDED 'pages' HERE so new books save the page count
  const { title, author, category, description, coverImage, pdfUrl, pages } = req.body;

  let finalPdfUrl = pdfUrl; // Default: use the manually entered link

  // IF A FILE WAS UPLOADED (via Multer)
  if (req.file) {
    // Create a URL pointing to your server's static 'uploads' folder
    finalPdfUrl = `${req.protocol}://${req.get("host")}/uploads/pdfs/${req.file.filename}`;
  }

  // Note: We need to associate the book with a user if your schema requires it.
  // Assuming req.user is populated by your auth middleware:
  const book = new Book({
    user: req.user._id, // Attach the user who created the book
    title,
    author,
    category,
    description,
    coverImage,
    pdfUrl: finalPdfUrl,
    pages: pages || 0, // Save pages (default to 0 if missing)
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

// 4. DELETE BOOK
export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    // OPTIONAL: Delete the local file to save server space
    if (book.pdfUrl && book.pdfUrl.includes("/uploads/pdfs/")) {
      const filename = book.pdfUrl.split("/").pop(); // Extract filename
      const filePath = path.join(process.cwd(), "uploads/pdfs", filename);
      
      // If file exists, delete it
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); 
      }
    }

    await book.deleteOne();
    // Also delete all reviews associated with this book (Clean up database)
    await Review.deleteMany({ book: req.params.id });
    
    res.json({ message: 'Book removed' });
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});

// 5. CREATE BOOK REVIEW (UPDATED FOR NEW SYSTEM)
export const createBookReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const book = await Book.findById(req.params.id);

  if (book) {
    // 1. Check if user already reviewed in the separate collection
    const alreadyReviewed = await Review.findOne({
      book: req.params.id,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("You have already reviewed this book");
    }

    // 2. Create the Review in the new Collection
    await Review.create({
      book: req.params.id,
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    // 3. Recalculate Average Rating (Aggregate)
    // This looks at the Review collection to get the real stats
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

    // Update the Book document with new summary stats
    // (If stats is empty, it means this was the first review, but aggregate usually handles it.
    // Safety check just in case: stats[0] might be undefined if something deleted reviews)
    book.numReviews = stats[0] ? stats[0].numReviews : 1;
    book.rating = stats[0] ? stats[0].avgRating : Number(rating);

    await book.save();
    
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Book not found");
  }
});