import mongoose from 'mongoose';

const ReadingClubEvaluationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  readingPerspectiveChange: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  mostBeneficialAspect: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  readingSkillsImprovement: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  mostLikedAspect: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  leastLikedAspect: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  booksToAddToNextList: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ReadingClubEvaluation = mongoose.model('ReadingClubEvaluation', ReadingClubEvaluationSchema);

export default ReadingClubEvaluation;