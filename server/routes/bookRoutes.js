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
  toggleTrending, 
} from "../controllers/bookController.js";

//  2. IMPORT ADMIN MIDDLEWARE
import { protect, admin } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// --- MULTER CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads/pdfs");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
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
  .post(protect, upload.single("pdfFile"), createBook);

// 2. Add a Review (Protected)
router.route("/:id/reviews").post(protect, createBookReview);

// 3. Toggle Trending Status (Admin Only) - NEW ROUTE
router.route("/:id/trending").put(protect, admin, toggleTrending); 

// 4. Get single book (Public) & Delete book (Protected)
// (Keep :id routes at the bottom to avoid conflicts with specific strings)
router.route("/:id")
  .get(getBookById)
  .delete(protect, deleteBook);

// --- PDF STREAM ENDPOINT ---
router.get("/stream/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || !book.pdfUrl) {
      return res.status(404).json({ message: "PDF not found" });
    }

    if (book.pdfUrl.startsWith("http") && !book.pdfUrl.includes("localhost")) {
       return res.redirect(book.pdfUrl);
    }

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