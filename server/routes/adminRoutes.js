import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
    getAdminStats, 
    getAllUsers, 
    toggleBlockUser, 
    deleteUser 
} from '../controllers/adminController.js';

const router = express.Router();

// Dashboard Stats
router.get('/stats', protect, admin, getAdminStats);

// User Management Routes
router.get('/users', protect, admin, getAllUsers);           
router.put('/users/:id/block', protect, admin, toggleBlockUser); 
router.delete('/users/:id', protect, admin, deleteUser);     

export default router;