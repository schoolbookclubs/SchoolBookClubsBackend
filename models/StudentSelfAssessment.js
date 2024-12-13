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

export default mongoose.model('StudentSelfAssessment', StudentSelfAssessmentSchema);
