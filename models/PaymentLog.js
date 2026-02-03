import mongoose from 'mongoose';

const paymentLogSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  mobile_no: String,
  category: String,
  order_id: {
    type: String,
    required: true
  },
  payment_id: String,
  error_code: String,
  error_description: String,
  error_source: String,
  error_step: String,
  error_reason: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PaymentLog', paymentLogSchema);
