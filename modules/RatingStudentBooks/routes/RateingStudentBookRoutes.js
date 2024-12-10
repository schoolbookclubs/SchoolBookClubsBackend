import express from 'express';
import RateingStudentBookController from '../controllers/RateingStudentBookController.js';

const router = express.Router();

// Route to create a new book rating
router.post('/create', RateingStudentBookController.createBookRating);

// Route to get ratings for a specific book
router.get('/book/:bookId', RateingStudentBookController.getBookRatings);

// Route to get ratings by a specific student
router.get('/student/:studentId', RateingStudentBookController.getStudentBookRatings);

export default router;
