import Razorpay from 'razorpay';
import crypto from 'crypto';
import Runner from '../models/Runner.js';
import PaymentLog from '../models/PaymentLog.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const feeMap = {
  '5 kilometer': 250,
  '10 kilometer': 500,
  '21 kilometer': 500
};

// Create Razorpay Order
const createOrder = async (req, res) => {
  try {
    const { category } = req.body;
    const amount = feeMap[category];

    if (!amount) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
  }
};

// Register Runner and Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const {
      first_name, last_name, email, mobile_no, gender, category,
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature!' });
    }

    const fee = feeMap[category];

    const newRunner = new Runner({
      first_name,
      last_name,
      email,
      mobile_no,
      gender,
      category,
      fee,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      payment_status: 'completed'
    });

    await newRunner.save();
    res.status(201).json({ message: 'Registration and payment successful!', data: newRunner });
  } catch (error) {
    console.error('Payment Verification Error:', error);

    // Partial log if we have enough info
    try {
      if (req.body.razorpay_order_id) {
        const failureLog = new PaymentLog({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          mobile_no: req.body.mobile_no,
          category: req.body.category,
          order_id: req.body.razorpay_order_id,
          payment_id: req.body.razorpay_payment_id,
          error_description: error.message,
          error_source: 'backend_verification',
          metadata: { body: req.body }
        });
        await failureLog.save();
      }
    } catch (logError) {
      console.error('Error saving failure log during verification:', logError);
    }

    res.status(400).json({ message: 'Payment verification failed!', error: error.message });
  }
};

// Log Payment Failure from Frontend
const logPaymentFailure = async (req, res) => {
  try {
    const {
      first_name, last_name, email, mobile_no, category,
      order_id, payment_id, error
    } = req.body;

    const failureLog = new PaymentLog({
      first_name,
      last_name,
      email,
      mobile_no,
      category,
      order_id,
      payment_id,
      error_code: error?.code,
      error_description: error?.description,
      error_source: error?.source,
      error_step: error?.step,
      error_reason: error?.reason,
      metadata: error || {}
    });

    await failureLog.save();
    res.status(201).json({ message: 'Payment failure logged successfully' });
  } catch (err) {
    console.error('Error logging payment failure:', err);
    res.status(500).json({ message: 'Failed to log payment failure', error: err.message });
  }
};

// Get Success Page
const getSuccessPage = async (req, res) => {
  try {
    const runner = await Runner.findById(req.params.id);
    if (!runner) {
      return res.status(404).render('index', { message: 'Runner not found' });
    }
    res.render('success', { runner });
  } catch (error) {
    console.error('Error fetching success details:', error);
    res.status(500).redirect('/');
  }
};

export default {
  createOrder,
  verifyPayment,
  logPaymentFailure,
  getSuccessPage
};
