import express from 'express';
import RateingStudentBookController from '../controllers/RateingStudentBookController.js';

const router = express.Router();

// Route to create a new book rating
router.post('/student/:studentId/book/:bookId', RateingStudentBookController.createBookRating);

// Route to get student's rating for a specific book
router.get('/student/:studentId/book/:bookId', RateingStudentBookController.getStudentBookRating);

// Route to get ratings for a specific book
router.get('/book/:bookId', RateingStudentBookController.getBookRatings);

// Route to get all student ratings for a specific book with details
router.get('/getBookStudentRatingsWithDetails/:bookId', RateingStudentBookController.getBookStudentRatingsWithDetails);

// Route to get ratings by a specific student with details
router.get('/getStudentRatingsBooksWithDetails/:studentId', RateingStudentBookController.getStudentRatingsWithDetails);

// Route to get ratings by school code
router.get('/RateingStudentBookbyschoolcode/:schoolCode', RateingStudentBookController.getRatingsBySchoolCode);

// Route to get count of unique rated books by school code
router.get('/uniquebooksoneschool/:schoolCode', RateingStudentBookController.getUniqueRatedBooksCount);

export default router;
