import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import session from "express-session"; // <--- NEW
import MongoStore from "connect-mongo"; // <--- NEW
import cookieParser from "cookie-parser"; // <--- NEW

// Import Routes
import bookRoutes from "./routes/bookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config(); 

const app = express();

// 1. MIDDLEWARE
// Important: 'credentials: true' is required for cookies to work with React
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],// Your React Frontend URL
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// 2. SESSION CONFIGURATION (The Magic Part)
app.use(session({
  secret: process.env.JWT_SECRET, // We can reuse your secret key
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }), // Store sessions in DB
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 Day
    httpOnly: true, // Prevents JavaScript from reading the cookie (Security)
    secure: false, // Set to true if using https in production
    sameSite: 'lax'
  }
}));

// Static Files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 3. ROUTES
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));