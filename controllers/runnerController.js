import Razorpay from 'razorpay';
import crypto from 'crypto';
import Runner from '../models/Runner.js';
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
    res.status(400).json({ message: 'Payment verification failed!', error: error.message });
  }
};

export default {
  createOrder,
  verifyPayment
};
