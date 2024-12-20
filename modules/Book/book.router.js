import express from 'express';
import { 
    createBook, 
    getAllBooks, 
    updateBook, 
    deleteBook,
    uploadBookImage,
    getBooksBySchoolCode,
    getBooksByTeacherId
} from './book.controller.js';
import { protect } from './book.middleware.js';

const router = express.Router();

router
    .route('/')
    .get(protect, getAllBooks)
    .post(
        protect,
        uploadBookImage,
        createBook
    );

router
    .route('/:id')
    .put(
        protect,
        uploadBookImage,
        updateBook
    )
    .delete(protect, deleteBook);

// Route to get books by school code without middleware
router.post('/getBooksBySchoolCode', getBooksBySchoolCode);

// Route to get books by teacher ID (no middleware)
router.get('/teacher/:teacherId/books', getBooksByTeacherId);

export default router;
