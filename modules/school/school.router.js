import express from 'express';
import { addSchool, deleteSchool, getSchools, updateSchool } from './school.controller.js';

const router = express.Router();

router.post('/add', addSchool);
router.get('/', getSchools);
router.put('/update/:id', updateSchool);
router.delete('/delete/:id', deleteSchool);

export default router;
