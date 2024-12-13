import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'عنوان الكتاب مطلوب'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'اسم المؤلف مطلوب'],
        trim: true
    },
    illustrator: {
        type: String,
        trim: true
    },
    bookImage: {
        type: String, // Cloudinary URL
        required: [true, 'صورة الكتاب مطلوبة']
    },
    numberOfPages: {
        type: Number,
        required: [true, 'عدد الصفحات مطلوب'],
        min: [1, 'يجب أن يكون عدد الصفحات أكبر من صفر']
    },
    Discussiondate: {
        type: Date,
        required: true
      },
    schoolCode: { type: String, required: true },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Bookmodel = mongoose.model('Book', bookSchema);

export default Bookmodel;
