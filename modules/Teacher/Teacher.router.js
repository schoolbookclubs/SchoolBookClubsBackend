import express from 'express';
import { signupTeacher, completeProfileTeacher, loginTeacher, updateTeacher, deleteTeacher, getAllTeachers, getTeacher } from './Teacher.controller.js';

const router = express.Router();

// Authentication routes
router.post('/signupTeacher', signupTeacher);
router.post('/complete-profile-teacher', completeProfileTeacher);
router.post('/loginTeacher', loginTeacher);

// CRUD routes
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);
router.get('/', getAllTeachers);
router.get('/:id', getTeacher);

export default router;
