import express from 'express';
import ParentController from './parent.controller.js';

const router = express.Router();

// Parent routes
router.post('/signup', ParentController.signup);
router.post('/login', ParentController.login);
router.post('/forget-password', ParentController.forgetPassword);
router.put('/:id', ParentController.update);
router.delete('/:id', ParentController.delete);

export default router;
