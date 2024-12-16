import mongoose from 'mongoose';

const StudentSelfAssessmentSchema = new mongoose.Schema({
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
  enjoyedReading: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  readUsefulBooks: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  madeNewFriends: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  conversationsImprovedUnderstanding: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  expressedOpinionFreely: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  increasedSelfConfidence: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  wouldEncourageClassmates: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  willJoinNextYear: {
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

StudentSelfAssessmentSchema.methods.calculateAverageRating = function() {
  const ratingKeys = [
    'enjoyedReading',
    'readUsefulBooks',
    'madeNewFriends',
    'conversationsImprovedUnderstanding',
    'expressedOpinionFreely',
    'increasedSelfConfidence',
    'wouldEncourageClassmates',
    'willJoinNextYear'
  ];

  const total = ratingKeys.reduce((sum, key) => sum + (this[key] || 0), 0);
  return total / ratingKeys.length;
};

export default mongoose.model('StudentSelfAssessment', StudentSelfAssessmentSchema);
