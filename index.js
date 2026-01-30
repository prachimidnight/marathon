import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import runnerRoutes from './routes/runnerRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB with cached connection
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    cachedConnection = conn;
    console.log('Connected to MongoDB...');
    return conn;
  } catch (err) {
    console.error('Could not connect to MongoDB:', err);
    throw err;
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory (must come before routes)
app.use(express.static('public'));

// API Routes
app.use('/api', runnerRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
