import mongoose from 'mongoose';

const RateingStudentBookSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  schoolCode: {
    type: String,
    required: true
  },
  recommendBook: {
    type: String,
    enum : ['نعم', 'لا'],
    trim: true
  },
  readingStartDate: {
    type: Date,
    required: true
  },
  readingEndDate: {
    type: Date,
    required: true
  },
  authorStyle: {
    type: String,
    trim: true
  },
  keyIdeas: {
    type: String,
    trim: true
  },
  likedIdeas: {
    type: String,
    trim: true
  },
  dislikedIdeas: {
    type: String,
    trim: true
  },
  memorableQuotes: {
    type: String,
    trim: true
  },
  potentialAdditions: {
    type: String,
    trim: true
  },
  personalImpact: {
    type: String,
    trim: true
  },
  bookRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('RateingStudentBook', RateingStudentBookSchema);
