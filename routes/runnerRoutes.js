import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import runnerController from '../controllers/runnerController.js';

const router = express.Router();

// Cloudinary Storage Config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'marathon/id_proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});

const upload = multer({ storage });

// Razorpay routes
router.post('/create-order', upload.single('id_proof'), runnerController.createOrder);
router.post('/verify-payment', runnerController.verifyPayment);
router.post('/log-payment-failure', runnerController.logPaymentFailure);
router.get('/runners', runnerController.getAllRunners);
router.get('/registration-success/:id', runnerController.getSuccessPage);

export default router;
