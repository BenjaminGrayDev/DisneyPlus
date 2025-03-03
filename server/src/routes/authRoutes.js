import express from 'express';
import { registerUser, loginUser, getUserProfile, googleAuth } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/google/callback', googleAuth);

export default router;
