import express from 'express';
import RateingStudentBookDraftController from '../controllers/RateingStudentBookDraftController.js';

const router = express.Router();

// Route to create a new book rating
router.post('/student/:studentId/book/:bookId', RateingStudentBookDraftController.createBookRating);

// Route to get student's rating for a specific book
router.get('/student/:studentId/book/:bookId', RateingStudentBookDraftController.getStudentBookRating);

// Route to get ratings for a specific book
router.get('/book/:bookId', RateingStudentBookDraftController.getBookRatings);

// Route to get all student ratings for a specific book with details
router.get('/getBookStudentRatingsWithDetails/:bookId', RateingStudentBookDraftController.getBookStudentRatingsWithDetails);

// Route to get ratings by a specific student with details
router.get('/getStudentRatingsBooksWithDetails/:studentId', RateingStudentBookDraftController.getStudentRatingsWithDetails);

// Route to get ratings by school code
router.get('/RateingStudentBookbyschoolcode/:schoolCode', RateingStudentBookDraftController.getRatingsBySchoolCode);

// Route to get count of unique rated books by school code
router.get('/uniquebooksoneschool/:schoolCode', RateingStudentBookDraftController.getUniqueRatedBooksCount);

export default router;
