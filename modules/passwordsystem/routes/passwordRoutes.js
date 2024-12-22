import express from 'express';
import passwordController from '../controllers/passwordController.js';

const router = express.Router();

// Initialize default password
router.post('/initialize', passwordController.initializePassword);

// Login route
router.post('/login', passwordController.login);

// Change password route
router.post('/change-password', passwordController.changePassword);

export default router;
