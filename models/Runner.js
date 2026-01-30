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
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile_no: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[6-9]\d{9}$/.test(v); // 10-digit Indian format
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
    enum: ['5K', '10K', 'Half Marathon', 'Full Marathon']
  },
  fee: {
    type: Number,
    required: true
  },
  registration_date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Runner', runnerSchema);
