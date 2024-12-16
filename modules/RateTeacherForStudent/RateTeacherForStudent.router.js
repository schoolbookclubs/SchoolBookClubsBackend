import express from 'express';
import { 
    createRating, 
    getRatingsByTeacher, 
    getRatingsByStudent,
    getRatingsTeacherById,
    getRatingsBySchoolCode,
    getStudentAttendanceBySchool
} from './RateTeacherForStudent.controller.js';
import { validateTeacherAndStudent } from '../../middleware/teacherRatingMiddleware.js';

const router = express.Router();

// Route to create a rating for a specific student by a teacher
router.post('/:teacherId/:studentId', 
    validateTeacherAndStudent, 
    createRating
);

// Route to get all ratings for a specific teacher
router.get('/teacher/:teacherId', 
    getRatingsByTeacher
);

// Route to get all ratings for a specific student
router.get('/student/:studentId', 
    getRatingsByStudent
);

// Route to get ratings by school code
router.get('/oneschool/:schoolCode/Teachersratings', 
    getRatingsBySchoolCode
);

// Route to get student attendance by school code
router.get('/attendance/oneschool/:schoolCode', getStudentAttendanceBySchool);

export default router;
