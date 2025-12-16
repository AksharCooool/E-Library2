import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Book from "../models/Book.js";

import {
  getBooks,
  getBookById,
  createBook,
  deleteBook,
  createBookReview, 
} from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// --- MULTER CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads/pdfs");
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Clean filename: remove spaces, add timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `book-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// --- ROUTES ---

// 1. Get all books (Public) & Create book (Protected)
router.route("/")
  .get(getBooks)
  .post(protect, upload.single("pdfFile"), createBook); // 🔒 Added protect here

// 2. Add a Review (Protected)
// This is the specific fix for your 500 Error
router.route("/:id/reviews").post(protect, createBookReview);

// 3. Get single book (Public) & Delete book (Protected)
router.route("/:id")
  .get(getBookById)
  .delete(protect, deleteBook); // 🔒 Added protect here

// --- PDF STREAM ENDPOINT ---
router.get("/stream/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || !book.pdfUrl) {
      return res.status(404).json({ message: "PDF not found" });
    }

    // Determine if it is a local file or external URL
    if (book.pdfUrl.startsWith("http") && !book.pdfUrl.includes("localhost")) {
       return res.redirect(book.pdfUrl);
    }

    // If it's a local file
    const filename = book.pdfUrl.split("/").pop();
    const filePath = path.join(process.cwd(), "uploads/pdfs", filename);

    if (fs.existsSync(filePath)) {
       res.setHeader("Content-Type", "application/pdf");
       res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
       const fileStream = fs.createReadStream(filePath);
       fileStream.pipe(res);
    } else {
       res.status(404).json({ message: "File not found on server" });
    }

  } catch (error) {
    console.error("STREAM ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;