import express from 'express';
import runnerController from '../controllers/runnerController.js';

const router = express.Router();

// POST endpoint for form submission
router.post('/register', runnerController.registerRunner);

export default router;
