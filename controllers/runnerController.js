import mongoose from 'mongoose';
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
    const { first_name, last_name, email, mobile_no, gender, category } = req.body;
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

    // Save initial runner data with 'pending' status
    const newRunner = new Runner({
      first_name,
      last_name,
      email,
      mobile_no,
      gender,
      category,
      fee: amount,
      order_id: order.id,
      payment_status: 'pending'
    });

    await newRunner.save();

    res.status(200).json({ ...order, runnerId: newRunner._id });
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
  }
};

// Register Runner and Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      // Update runner status to failed if signature fails
      await Runner.findOneAndUpdate(
        { order_id: razorpay_order_id },
        { payment_status: 'failed' }
      );
      return res.status(400).json({ message: 'Invalid payment signature!' });
    }

    const updatedRunner = await Runner.findOneAndUpdate(
      { order_id: razorpay_order_id },
      {
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        payment_status: 'completed'
      },
      { new: true }
    );

    if (!updatedRunner) {
      return res.status(404).json({ message: 'Runner registration not found for this order!' });
    }

    res.status(201).json({ message: 'Registration and payment successful!', data: updatedRunner });
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

    // Update Runner status to failed
    await Runner.findOneAndUpdate(
      { order_id: order_id },
      { payment_status: 'failed' }
    );

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

// Get all runners with search and filters
const getAllRunners = async (req, res) => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;
    if (!dbConnected) {
      return res.status(503).json({
        message: 'Database is offline',
        error: 'The server could not connect to MongoDB Atlas. Please check your network or IP whitelisting.'
      });
    }

    const { search, category, status } = req.query;
    let query = {};

    // Search filter (name, email, phone)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email: searchRegex },
        { mobile_no: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Status filter
    if (status && status !== 'all') {
      query.payment_status = status;
    }

    const runners = await Runner.find(query).sort({ registration_date: -1 });
    res.status(200).json(runners);
  } catch (error) {
    console.error('Error fetching runners:', error);
    res.status(500).json({ message: 'Error fetching runners', error: error.message });
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
  getAllRunners,
  getSuccessPage
};
