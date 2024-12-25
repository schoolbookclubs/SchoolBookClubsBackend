import express from 'express';
import { 
    signupTeacher, 
    completeProfileTeacher, 
    loginTeacher, 
    updateTeacher, 
    deleteTeacher, 
    getAllTeachers, 
    getTeacher, 
    forgetPasswordTeacher,
    generateVerificationCode,
    verifyCodeAndResetPassword} from './Teacher.controller.js';

const router = express.Router();

// Authentication routes
router.post('/signupTeacher', signupTeacher);
router.post('/complete-profile-teacher', completeProfileTeacher);
router.post('/loginTeacher', loginTeacher);
router.post('/forget-password', forgetPasswordTeacher);
router.post('/generate-verification-code', generateVerificationCode);
router.post('/verify-code-reset-password', verifyCodeAndResetPassword);

// CRUD routes
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);
router.get('/', getAllTeachers);
router.get('/:id', getTeacher);

// Get students by school code

export default router;
