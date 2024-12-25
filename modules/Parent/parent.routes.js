import express from 'express';
import { signup, login, forgetPassword, updateParent, deleteParent,generateVerificationCode,verifyCodeAndResetPassword } from './parent.controller.js';

const router = express.Router();

// Parent routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forget-password', forgetPassword);
router.put('/:id', updateParent);
router.delete('/:id', deleteParent);
router.post('/generate-verification-code', generateVerificationCode);
router.post('/verify-code-reset-password', verifyCodeAndResetPassword);
export default router;
