import express from 'express';
import multer from 'multer';
import path from 'path';
import runnerController from '../controllers/runnerController.js';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/id_proofs');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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
