import Book from "../models/Book.js";
import fs from "fs";
import path from "path";

// 1. GET ALL BOOKS
export const getBooks = async (req, res) => {
  try {
    // Sort by newest first (-1)
    const books = await Book.find({}).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. GET SINGLE BOOK
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. CREATE BOOK (Handles File Upload OR Link)
export const createBook = async (req, res) => {
  try {
    const { title, author, category, description, coverImage, pdfUrl } = req.body;

    let finalPdfUrl = pdfUrl; // Default: use the manually entered link

    // IF A FILE WAS UPLOADED (via Multer)
    if (req.file) {
      // Create a URL pointing to your server's static 'uploads' folder
      // Example: http://localhost:5000/uploads/pdfs/book-1715622.pdf
      finalPdfUrl = `${req.protocol}://${req.get("host")}/uploads/pdfs/${req.file.filename}`;
    }

    const book = new Book({
      title,
      author,
      category,
      description,
      coverImage,
      pdfUrl: finalPdfUrl, // Saves either the File URL or the External Link
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);

  } catch (error) {
    console.error("Create Book Error:", error);
    res.status(400).json({ message: 'Invalid data' });
  }
};

// 4. DELETE BOOK (And delete the PDF file if it exists locally)
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      // OPTIONAL: Delete the local file to save server space
      // Check if the pdfUrl contains "/uploads/pdfs/" (meaning it's a local file)
      if (book.pdfUrl && book.pdfUrl.includes("/uploads/pdfs/")) {
        const filename = book.pdfUrl.split("/").pop(); // Extract filename
        const filePath = path.join(process.cwd(), "uploads/pdfs", filename);
        
        // If file exists, delete it
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); 
        }
      }

      await book.deleteOne();
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};