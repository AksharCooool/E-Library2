import express from 'express';
import { chat, generateSynopsis } from "../controllers/aiControllers.js"; 

const router = express.Router();

// Matches: /api/ai/chat
router.post("/chat", chat);

// Matches: /api/ai/generate-synopsis
router.post("/generate-synopsis", generateSynopsis); 

export default router;