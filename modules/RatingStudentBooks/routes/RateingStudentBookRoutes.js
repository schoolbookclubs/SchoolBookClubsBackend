import express from 'express';
import RateingStudentBookController from '../controllers/RateingStudentBookController.js';

const router = express.Router();

// Route to create a new book rating
router.post('/create', RateingStudentBookController.createBookRating);

// Route to get ratings for a specific book
router.get('/book/:bookId', RateingStudentBookController.getBookRatings);

// Route to get ratings by a specific student
router.get('/student/:studentId', RateingStudentBookController.getStudentBookRatings);

// Route to get ratings by school code
router.get('/RateingStudentBookbyschoolcode/:schoolCode', RateingStudentBookController.getRatingsBySchoolCode);

// Route to get count of unique rated books by school code
router.get('/uniquebooksoneschool/:schoolCode', RateingStudentBookController.getUniqueRatedBooksCount);

export default router;
