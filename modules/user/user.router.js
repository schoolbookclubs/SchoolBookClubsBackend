import { Router } from "express";
import { forgetPassword, logout, signup, studentLogin, teacherLogin, parentLogin } from "./user.controller.js";

const router = Router();

router.post('/signup', signup);
router.post('/student/login', studentLogin);
router.post('/teacher/login', teacherLogin);
router.post('/parent/login', parentLogin);
router.post('/logout', logout);
router.post('/forgetPassword', forgetPassword);

export default router;