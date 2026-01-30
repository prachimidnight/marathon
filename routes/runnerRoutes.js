import express from 'express';
import runnerController from '../controllers/runnerController.js';

const router = express.Router();

// Static index.html will be served automatically by Cloudflare Pages
// POST endpoint for form submission
router.post('/register', runnerController.registerRunner);

export default router;
