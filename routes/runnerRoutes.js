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
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    // Sanitize public_id: remove spaces and special characters to prevent URL issues
    public_id: (req, file) => {
      const timestamp = Date.now();
      const sanitizedName = file.originalname
        .split('.')[0]
        .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
        .toLowerCase();
      return `${timestamp}_${sanitizedName}`;
    }
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
