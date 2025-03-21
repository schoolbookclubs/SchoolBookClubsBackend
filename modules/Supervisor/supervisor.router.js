import express from 'express';
import {
    signupSupervisor,
    completeProfileSupervisor,
    loginSupervisor,
    updateSupervisor,
    deleteSupervisor,
    getAllSupervisors,
    getSupervisor,
    forgetPasswordSupervisor,
    generateVerificationCode,
    verifyCodeAndResetPassword
} from './supervisor.controller.js';

const router = express.Router();

// Authentication routes
router.post('/signupSupervisor', signupSupervisor);
router.post('/complete-profile-supervisor', completeProfileSupervisor);
router.post('/loginSupervisor', loginSupervisor);
router.post('/forget-password', forgetPasswordSupervisor);

// CRUD routes
router.put('/:id', updateSupervisor);
router.delete('/:id', deleteSupervisor);
router.get('/', getAllSupervisors);
router.get('/:id', getSupervisor);
router.post('/generate-verification-code', generateVerificationCode);
router.post('/verify-code-reset-password', verifyCodeAndResetPassword);
export default router;
