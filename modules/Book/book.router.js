import express from 'express';
import * as bookController from './book.controller.js';
import { protect } from './book.middleware.js';

const router = express.Router();

router.use(protect); // Ensure only authenticated teachers can access

router
    .route('/')
    .post(
        bookController.uploadBookImage, 
        bookController.createBook
    )
    .get(bookController.getAllBooks);

router
    .route('/:id')
    .get(bookController.getBook)
    .patch(
        bookController.uploadBookImage, 
        bookController.updateBook
    )
    .delete(bookController.deleteBook);

export default router;
