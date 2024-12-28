import express from 'express';
import { signup, login, forgetPassword, updateParent, deleteParent,generateVerificationCode,verifyCodeAndResetPassword, getallParentsBySchoolCode } from './parent.controller.js';

const router = express.Router();

// Parent routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forget-password', forgetPassword);
router.put('/:id', updateParent);
router.delete('/:id', deleteParent);
router.post('/generate-verification-code', generateVerificationCode);
router.post('/verify-code-reset-password', verifyCodeAndResetPassword);
router.get('/AllParents/:schoolCode',getallParentsBySchoolCode);

export default router;
