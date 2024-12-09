import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import Bookmodel from '../../models/book.model.js';
import dotenv from 'dotenv';
dotenv.config();
// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer upload configuration
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Upload image to Cloudinary
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'school-book-club/books' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(file.buffer);
    });
};

// Create a new book
export const createBook = async (req, res) => {
    try {
        const { 
            title, 
            author, 
            illustrator, 
            numberOfPages, 
            bookLink,
            schoolCode
        } = req.body;
        
        // Check if image is uploaded
        if (!req.file) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'صورة الكتاب مطلوبة' 
            });
        }

        // Upload image to Cloudinary
        const bookImageUrl = await uploadToCloudinary(req.file);

        // Create book with Cloudinary image URL
        const newBook = await Bookmodel.create({
            title,
            author,
            illustrator,
            bookImage: bookImageUrl,
            numberOfPages,
            bookLink,
            schoolCode,
            teacher: req.user._id 
        });

        res.status(201).json({
            status: 'تم انشاء الكتاب بنجاح',
            data: newBook
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get all books
export const getAllBooks = async (req, res) => {
    try {
        const books = await Bookmodel.find({ teacher: req.user._id }).populate('teacher');
        
        res.status(200).json({
            status: 'تم العثور على كل الكتب بنجاح',
            results: books.length,
            data: books
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get a specific book
export const getBook = async (req, res) => {
    try {
        const book = await Bookmodel.findOne({ 
            _id: req.params.id, 
            teacher: req.user._id 
        }).populate('teacher');

        if (!book) {
            return res.status(404).json({
                status: 'error',
                message: 'هذا الكتاب غير موجود'
            });
        }

        res.status(200).json({
            status: 'تم العثور على الكتاب بنجاح',
            data: book
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update a book
export const updateBook = async (req, res) => {
    try {
        const { 
            title, 
            author, 
            illustrator, 
            numberOfPages, 
            bookLink 
        } = req.body;
        
        const updateData = { 
            title, 
            author, 
            illustrator,
            numberOfPages,
            bookLink 
        };

        // If a new image is uploaded
        if (req.file) {
            const bookImageUrl = await uploadToCloudinary(req.file);
            updateData.bookImage = bookImageUrl;
        }

        const updatedBook = await Bookmodel.findOneAndUpdate(
            { _id: req.params.id, teacher: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({
                status: 'error',
                message: 'هذا الكتاب غير موجود'
            });
        }

        res.status(200).json({
            status: 'تم تعديل الكتاب بنجاح',
            data: updatedBook
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete a book
export const deleteBook = async (req, res) => {
    try {
        const deletedBook = await Bookmodel.findOneAndDelete({ 
            _id: req.params.id, 
            teacher: req.user._id 
        });

        if (!deletedBook) {
            return res.status(404).json({
                status: 'error',
                message: 'هذا الكتاب غير موجود'
            });
        }

        res.status(204).json({
            status: 'تم حذف الكتاب بنجاح',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Middleware for file upload
export const uploadBookImage = upload.single('bookImage');
