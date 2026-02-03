                                                                                    import mongoose from 'mongoose';

const runnerSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true; // Optional
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  mobile_no: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\+91[6-9]\d{9}$/.test(v); // +91 followed by 10-digit Indian number
      },
      message: props => `${props.value} is not a valid Indian mobile number!`
    }
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  category: {
    type: String,
    required: true,
    enum: ['5 kilometer', '10 kilometer', '21 kilometer']
  },
  fee: {
    type: Number,
    required: true
  },
  payment_id: String,
  order_id: String,
  signature: String,
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  registration_date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Runner', runnerSchema);
