import express from 'express';
import * as studentController from './student.controller.js';

const router = express.Router();

router.post('/signup', studentController.signup);
router.post('/login', studentController.login);
router.post('/forget-password', studentController.forgetPassword);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

export default router;
