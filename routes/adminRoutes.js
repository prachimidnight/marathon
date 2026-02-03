import express from 'express';
import adminController from '../controllers/adminController.js';

const router = express.Router();

// Public login routes
router.get('/login', adminController.getLoginPage);
router.post('/login', adminController.login);

// Protected admin routes
router.get('/admin/dashboard', adminController.authMiddleware, adminController.getDashboard);
router.get('/logout', adminController.logout);

export default router;
