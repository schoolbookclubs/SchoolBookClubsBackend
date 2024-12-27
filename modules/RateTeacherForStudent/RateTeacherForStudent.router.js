import express from 'express';
import { 
    createRating, 
    getRatingsByTeacher, 
    getRatingsByStudent,
    getRatingsTeacherById,
    getRatingsBySchoolCode,
    getStudentAttendanceBySchool,
    getRatingsTeacherByhisId,
    getRatingsByBookId
} from './RateTeacherForStudent.controller.js';

const router = express.Router();

// Route to create a rating for a specific teacher
router.post('/:teacherId/:studentId', 
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

// Route to get all ratings for a specific teacher
router.get('/teacherrates/:teacherId', 
    getRatingsTeacherByhisId
);

// Route to get student attendance by school code
router.get('/attendance/oneschool/:schoolCode', getStudentAttendanceBySchool);

// Route to get all ratings for a specific book
router.get('/book/:bookId', getRatingsByBookId);
export default router;
