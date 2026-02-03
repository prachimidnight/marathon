import express from 'express';
import runnerController from '../controllers/runnerController.js';

const router = express.Router();

// Razorpay routes
router.post('/create-order', runnerController.createOrder);
router.post('/verify-payment', runnerController.verifyPayment);
router.post('/log-payment-failure', runnerController.logPaymentFailure);
router.get('/registration-success/:id', runnerController.getSuccessPage);

export default router;
