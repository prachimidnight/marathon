import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import runnerRoutes from './routes/runnerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable buffering so queries fail immediately if DB is down
mongoose.set('bufferCommands', false);

const app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Connect to MongoDB with cached connection
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not defined in environment variables. Server will run but DB features will fail.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    cachedConnection = conn;
    console.log(`Connected to MongoDB: ${conn.connection.name}...`);
    return conn;
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    // Log the error but don't rethrow to keep the server alive for UI testing
    return null;
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'id_proofs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// Serve static files from public directory (must come before routes)
app.use(express.static(path.join(__dirname, 'public')));

// API & Admin Routes
app.use('/api', runnerRoutes);
app.use('/', adminRoutes);

// Home route (Registration Page)
app.get('/', (req, res) => res.render('index'));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
