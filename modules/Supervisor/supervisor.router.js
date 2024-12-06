import express from 'express';
import {
    signupSupervisor,
    completeProfileSupervisor,
    loginSupervisor,
    updateSupervisor,
    deleteSupervisor,
    getAllSupervisors,
    getSupervisor
} from './supervisor.controller.js';

const router = express.Router();

// Authentication routes
router.post('/signupSupervisor', signupSupervisor);
router.post('/complete-profile-supervisor', completeProfileSupervisor);
router.post('/loginSupervisor', loginSupervisor);

// CRUD routes
router.put('/:id', updateSupervisor);
router.delete('/:id', deleteSupervisor);
router.get('/', getAllSupervisors);
router.get('/:id', getSupervisor);

export default router;
