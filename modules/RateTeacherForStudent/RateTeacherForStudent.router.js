import express from 'express';
import { 
    createRating, 
    getRatingsByTeacher, 
    getRatingsByStudent 
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

export default router;