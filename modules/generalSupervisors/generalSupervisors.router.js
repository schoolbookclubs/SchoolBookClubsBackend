import { Router } from 'express';
import generalSupervisorController from './generalSupervisors.controller.js';

const router = Router();

// Routes
router.post('/signup', generalSupervisorController.signup);
router.post('/login', generalSupervisorController.login);
router.post('/generate-verification-code', generalSupervisorController.generateVerificationCode);
router.post('/verify-code-reset-password', generalSupervisorController.verifyCodeAndResetPassword);
router.get('/', generalSupervisorController.getAllSupervisors);
router.get('/:id', generalSupervisorController.getSupervisor);
router.patch('/:id', generalSupervisorController.updateSupervisor);
router.delete('/:id', generalSupervisorController.deleteSupervisor);

export default router;
