import Runner from '../models/Runner.js';

// API endpoint for registration (no longer renders EJS)

const registerRunner = async (req, res) => {
  try {
    const { first_name, last_name, email, mobile_no, gender, category } = req.body;

    // Dynamic Fee Logic (INR)
    const feeMap = {
      '5K': 1850,
      '10K': 3200,
      'Half Marathon': 5000,
      'Full Marathon': 7350
    };

    const fee = feeMap[category];

    const newRunner = new Runner({
      first_name,
      last_name,
      email,
      mobile_no,
      gender,
      category,
      fee
    });

    await newRunner.save();
    res.status(201).json({ message: 'Registration successful!', data: newRunner });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(400).json({ message: 'Registration failed!', error: error.message });
  }
};

export default {
  registerRunner
};
