import mongoose from 'mongoose';
import Runner from '../models/Runner.js';

// Static credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin@123';

const getLoginPage = (req, res) => {
  res.render('login', { error: null });
};

const login = (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.cookie('admin_token', 'logged_in', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 24 hours
    return res.redirect('/admin/dashboard');
  }

  res.render('login', { error: 'Invalid username or password' });
};

const getDashboard = async (req, res) => {
  try {
    let runners = [];
    const dbConnected = mongoose.connection.readyState === 1;

    if (dbConnected) {
      try {
        runners = await Runner.find().sort({ registration_date: -1 });
      } catch (dbError) {
        console.error('Database query failed:', dbError.message);
      }
    }

    res.render('dashboard', {
      runners,
      dbStatus: dbConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const logout = (req, res) => {
  res.clearCookie('admin_token');
  res.redirect('/login');
};

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  if (req.cookies && req.cookies.admin_token === 'logged_in') {
    next();
  } else {
    res.redirect('/login');
  }
};

export default {
  getLoginPage,
  login,
  getDashboard,
  logout,
  authMiddleware
};
